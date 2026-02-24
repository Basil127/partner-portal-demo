/**
 * E2E tests for booking card rendering in the AI chat.
 *
 * These tests run against the live application stack (npm run dev).
 * AI responses are non-deterministic so tests use generous timeouts.
 *
 * The tests are grouped into two describe blocks:
 *  1. "Booking flow (happy path)" — serial tests that chain:
 *       a) Send a complete booking request → expect single pricing card
 *       b) Click "Confirm Booking" → expect single confirmed card, no more confirm button
 *       c) Reload the page → confirmed card persists from DB
 *  2. "Booking card deduplication (mocked stream)" — uses route interception to inject
 *     a stream that mimics the multi-step AI bug (multiple tool parts in one message)
 *     and verifies only the correct, deduplicated card is shown.
 */

import { test, expect } from '@playwright/test';

// ─── Shared state for serial tests ───────────────────────────────────────────
// These are populated by test step 1 and consumed by steps 2 and 3.
let persistedChatUrl = '';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Happy path (serial — each step builds on the previous) ──────────────────
test.describe.serial('Booking flow (happy path)', () => {
	// Each test in this group can take up to 90 s because of AI model latency.
	test.setTimeout(90_000);

	test('Step 1 — single pricing card with confirm button', async ({ page }) => {
		await page.goto('/chat');
		await expect(page.getByTestId('chat-container')).toBeVisible({ timeout: 10_000 });

		// Send a fully-specified booking request so the model can go straight to
		// get_room_pricing without needing to ask for more information.
		const bookingRequest = [
			'Please book a KING room at HOTEL1.',
			'Arrival: 2026-07-01, Departure: 2026-07-03.',
			'2 adults.',
			'Guest: Alice Tester, email: alice.tester@example.com, phone: +1-555-0101.',
			'Show me the price.',
		].join(' ');

		await page.getByTestId('chat-textarea').fill(bookingRequest);
		await page.getByTestId('chat-submit').click();

		// Wait until the pricing card is visible (model has called get_room_pricing).
		await expect(page.getByTestId('pricing-card')).toBeVisible({ timeout: 60_000 });

		// Save the URL so subsequent serial tests can navigate back to this chat.
		persistedChatUrl = page.url();

		// KEY ASSERTION: exactly one pricing card should be visible even if the model
		// made multiple get_room_pricing calls internally (deduplication fix).
		const pricingCards = page.getByTestId('pricing-card');
		await expect(pricingCards).toHaveCount(1);

		// The pricing card must have exactly one "Confirm Booking" button.
		const confirmButtons = page.getByTestId('confirm-booking-button');
		await expect(confirmButtons).toHaveCount(1);

		// No confirmed or failed reservation cards should be present yet.
		await expect(page.getByTestId('booking-confirmed-card')).not.toBeVisible();
		await expect(page.getByTestId('booking-failed-card')).not.toBeVisible();
	});

	test('Step 2 — clicking Confirm Booking shows success card', async ({ page }) => {
		// If Step 1 failed to set the URL, skip this test gracefully.
		test.skip(!persistedChatUrl, 'Step 1 did not complete — skipping confirmation test');

		await page.goto(persistedChatUrl);

		// Wait for the pricing card to rehydrate from DB.
		await expect(page.getByTestId('pricing-card')).toBeVisible({ timeout: 15_000 });

		// Click the confirm button — this sends "Yes, please confirm the booking".
		await page.getByTestId('confirm-booking-button').click();

		// The model calls create_reservation and the confirmed card should appear.
		await expect(page.getByTestId('booking-confirmed-card')).toBeVisible({ timeout: 60_000 });

		// The confirmed card must contain a confirmation-number section.
		await expect(page.getByTestId('booking-confirmed-card')).toContainText('Confirmation', {
			ignoreCase: true,
		});

		// No failed booking card should be present.
		await expect(page.getByTestId('booking-failed-card')).not.toBeVisible();

		// KEY ASSERTION: the latest assistant message (which shows the reservation
		// result) must NOT show a pricing card's confirm button — once a reservation
		// has been attempted, the confirm button is suppressed for that message.
		// We can't suppress the button in *earlier* messages (different UIMessage
		// objects), so we check the specific confirmed-card message has no sibling
		// confirm button by verifying the confirm button count doesn't increase
		// after the booking (there may still be 1 in the older pricing message).
		const confirmButtonCount = await page.getByTestId('confirm-booking-button').count();
		// At most 1 confirm button (from the original pricing message before booking).
		expect(confirmButtonCount).toBeLessThanOrEqual(1);
	});

	test('Step 3 — confirmed card persists after page reload', async ({ page }) => {
		test.skip(!persistedChatUrl, 'Step 1 did not complete — skipping reload test');

		await page.goto(persistedChatUrl);

		// Wait for initial load.
		await expect(page.getByTestId('booking-confirmed-card')).toBeVisible({ timeout: 15_000 });

		// Hard reload — forces messages to be re-fetched from the database.
		await page.reload();

		// The confirmed card must survive the reload (persisted via saveAssistantResponse).
		await expect(page.getByTestId('booking-confirmed-card')).toBeVisible({ timeout: 15_000 });

		// The confirmed card content should still be present.
		await expect(page.getByTestId('booking-confirmed-card')).toContainText('Confirmation', {
			ignoreCase: true,
		});

		// No failure card after reload.
		await expect(page.getByTestId('booking-failed-card')).not.toBeVisible();
	});
});

// ─── Deduplication via mocked SSE stream ─────────────────────────────────────
//
// These tests intercept the /api/ai/chat endpoint and return a crafted
// AI SDK UI-message stream (the compact data-stream protocol used by
// toUIMessageStreamResponse / DefaultChatTransport).
//
// Each mocked stream simulates the "duplicate tool call" scenario that was
// causing multiple cards to appear, and verifies the deduplication fixes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a minimal AI SDK data-stream fulfill payload for Playwright route interception.
 *
 * The AI SDK "Data Stream Protocol" used by toUIMessageStreamResponse encodes
 * each event as:  <type_code>:<json_payload>\n
 *
 * Relevant type codes (from ai package source):
 *   0  – text delta
 *   8  – message id assignment
 *   9  – tool result (legacy)
 *   a  – finish message
 *   b  – tool call id
 *   c  – tool input delta
 *   e  – finish step
 *   f  – init stream:             f:{messageId:"..."}
 *   g  – tool input available     (input complete)
 *   h  – tool output available    (tool result)
 *   i  – tool output error
 */
interface StreamFulfill {
	status: number;
	headers: Record<string, string>;
	body: string;
}

function buildDataStream(chunks: string[]): StreamFulfill {
	return {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'x-vercel-ai-data-stream': 'v1',
		},
		body: chunks.join(''),
	};
}

/** Serialise a single data-stream event line. */
function dsLine(code: string, payload: unknown): string {
	return `${code}:${JSON.stringify(payload)}\n`;
}

/**
 * Returns a complete stream that emits two `get_room_pricing` tool calls
 * followed by a text response — simulating a model that called the tool twice.
 */
function doublePricingStream(msgId: string): StreamFulfill {
	const tc1 = 'tc-pricing-1';
	const tc2 = 'tc-pricing-2';
	const pricingArgs = {
		hotelCode: 'HOTEL1',
		arrivalDate: '2026-07-01',
		departureDate: '2026-07-03',
		adults: 2,
	};
	const pricingResult = {
		offer: { total: { amountBeforeTax: 200, amountAfterTax: 240, currencyCode: 'USD' } },
	};

	const lines = [
		// Init
		dsLine('f', { messageId: msgId }),
		// Tool call 1 — get_room_pricing
		dsLine('b', { toolCallId: tc1, toolName: 'get_room_pricing' }),
		dsLine('g', { toolCallId: tc1, input: pricingArgs }),
		dsLine('h', { toolCallId: tc1, output: pricingResult }),
		// Tool call 2 — get_room_pricing (duplicate, simulates multi-step retry)
		dsLine('b', { toolCallId: tc2, toolName: 'get_room_pricing' }),
		dsLine('g', { toolCallId: tc2, input: { ...pricingArgs, ratePlanCode: 'BAR' } }),
		dsLine('h', { toolCallId: tc2, output: pricingResult }),
		// Text response
		dsLine('0', 'Here is the pricing for your room. '),
		dsLine('0', 'Click Confirm Booking when ready.'),
		// Finish step and message
		dsLine('e', { finishReason: 'tool-calls', usage: { promptTokens: 10, completionTokens: 5 } }),
		dsLine('a', { finishReason: 'stop', usage: { promptTokens: 10, completionTokens: 5 } }),
	];
	return buildDataStream(lines);
}

/**
 * Returns a stream that emits two failed `create_reservation` tool calls —
 * simulating a model that ignored the "exactly once" instruction.
 */
function doubleFailedReservationStream(msgId: string): StreamFulfill {
	const tc1 = 'tc-res-1';
	const tc2 = 'tc-res-2';
	const resArgs = {
		hotelId: 'HOTEL1',
		arrivalDate: '2026-07-01',
		departureDate: '2026-07-03',
		roomType: 'KING',
		ratePlanCode: 'BAR',
		guests: [{ firstName: 'Alice', lastName: 'Tester', adult: true }],
		email: 'alice@example.com',
		phone: '+1-555-0101',
	};
	const errorResult = { detail: 'Room type KING not available for the selected dates.' };

	const lines = [
		dsLine('f', { messageId: msgId }),
		// First failed create_reservation
		dsLine('b', { toolCallId: tc1, toolName: 'create_reservation' }),
		dsLine('g', { toolCallId: tc1, input: resArgs }),
		dsLine('i', { toolCallId: tc1, output: errorResult }),
		// Second failed create_reservation (model retried — this is the bug)
		dsLine('b', { toolCallId: tc2, toolName: 'create_reservation' }),
		dsLine('g', { toolCallId: tc2, input: resArgs }),
		dsLine('i', { toolCallId: tc2, output: errorResult }),
		// Text
		dsLine('0', 'I was unable to create the reservation.'),
		dsLine('e', { finishReason: 'stop', usage: { promptTokens: 10, completionTokens: 5 } }),
		dsLine('a', { finishReason: 'stop', usage: { promptTokens: 10, completionTokens: 5 } }),
	];
	return buildDataStream(lines);
}

/**
 * Returns a stream that emits a successful `create_reservation` tool call —
 * verifying that the confirmed card renders correctly.
 */
function successfulReservationStream(msgId: string): StreamFulfill {
	const tc1 = 'tc-res-success';
	const resArgs = {
		hotelId: 'HOTEL1',
		arrivalDate: '2026-07-01',
		departureDate: '2026-07-03',
		roomType: 'KING',
		ratePlanCode: 'BAR',
		guests: [{ firstName: 'Alice', lastName: 'Tester', adult: true }],
		email: 'alice@example.com',
		phone: '+1-555-0101',
	};
	const successResult = {
		reservations: {
			reservation: [
				{
					reservationIdList: [
						{ id: '123456', type: 'Reservation' },
						{ id: 'CONF-ABC123', type: 'CONFIRMATION' },
					],
					roomStay: {
						arrivalDate: '2026-07-01',
						departureDate: '2026-07-03',
						roomType: 'KING',
						ratePlanCode: 'BAR',
						guestCounts: { adults: 2, children: 0 },
						total: { amountBeforeTax: 200, amountAfterTax: 240, currencyCode: 'USD' },
					},
					reservationGuests: [
						{
							primary: true,
							profileInfo: {
								profile: {
									customer: {
										personName: [{ givenName: 'Alice', surname: 'Tester' }],
									},
									email: 'alice@example.com',
									phoneNumber: '+1-555-0101',
								},
							},
						},
					],
					hotelId: 'HOTEL1',
					reservationStatus: 'Reserved',
				},
			],
		},
	};

	const lines = [
		dsLine('f', { messageId: msgId }),
		dsLine('b', { toolCallId: tc1, toolName: 'create_reservation' }),
		dsLine('g', { toolCallId: tc1, input: resArgs }),
		dsLine('h', { toolCallId: tc1, output: successResult }),
		dsLine('0', 'Your reservation is confirmed! Confirmation number: CONF-ABC123.'),
		dsLine('e', { finishReason: 'tool-calls', usage: { promptTokens: 10, completionTokens: 5 } }),
		dsLine('a', { finishReason: 'stop', usage: { promptTokens: 10, completionTokens: 5 } }),
	];
	return buildDataStream(lines);
}

test.describe('Booking card deduplication (mocked AI stream)', () => {
	test.setTimeout(30_000);

	test('shows exactly one pricing card when AI calls get_room_pricing twice', async ({ page }) => {
		let callCount = 0;
		await page.route('**/api/ai/chat', async (route) => {
			callCount++;
			const msgId = `mock-msg-${callCount}`;
			await route.fulfill(doublePricingStream(msgId));
		});

		await page.goto('/chat');
		await expect(page.getByTestId('chat-container')).toBeVisible({ timeout: 10_000 });

		await page.getByTestId('chat-textarea').fill('Book a KING room at HOTEL1');
		await page.getByTestId('chat-submit').click();

		// Wait for the pricing card to appear
		await expect(page.getByTestId('pricing-card')).toBeVisible({ timeout: 15_000 });

		// KEY ASSERTION: despite two tool calls in the stream, only ONE card is shown
		await expect(page.getByTestId('pricing-card')).toHaveCount(1);
		await expect(page.getByTestId('confirm-booking-button')).toHaveCount(1);
	});

	test('shows at most one failure card when AI calls create_reservation twice', async ({
		page,
	}) => {
		let callCount = 0;
		await page.route('**/api/ai/chat', async (route) => {
			callCount++;
			const msgId = `mock-msg-${callCount}`;
			await route.fulfill(doubleFailedReservationStream(msgId));
		});

		await page.goto('/chat');
		await expect(page.getByTestId('chat-container')).toBeVisible({ timeout: 10_000 });

		await page.getByTestId('chat-textarea').fill('Book a KING room at HOTEL1 — confirm now');
		await page.getByTestId('chat-submit').click();

		// Wait for the assistant message to appear
		await expect(page.getByTestId('message-assistant')).toBeVisible({ timeout: 15_000 });

		// KEY ASSERTION: only ONE booking failure card, not two
		await expect(page.getByTestId('booking-failed-card')).toHaveCount(1);

		// No confirmed card
		await expect(page.getByTestId('booking-confirmed-card')).not.toBeVisible();

		// No pricing-card confirm button (pricing was suppressed because reservation was attempted)
		await expect(page.getByTestId('confirm-booking-button')).not.toBeVisible();
	});

	test('shows confirmed card when create_reservation succeeds', async ({ page }) => {
		let callCount = 0;
		await page.route('**/api/ai/chat', async (route) => {
			callCount++;
			const msgId = `mock-msg-${callCount}`;
			await route.fulfill(successfulReservationStream(msgId));
		});

		await page.goto('/chat');
		await expect(page.getByTestId('chat-container')).toBeVisible({ timeout: 10_000 });

		await page.getByTestId('chat-textarea').fill('Yes, please confirm the booking');
		await page.getByTestId('chat-submit').click();

		// KEY ASSERTION: BookingConfirmedCard is shown
		await expect(page.getByTestId('booking-confirmed-card')).toBeVisible({ timeout: 15_000 });

		// Confirmation number from the mocked result should be visible
		await expect(page.getByTestId('booking-confirmed-card')).toContainText('CONF-ABC123');

		// No failure card
		await expect(page.getByTestId('booking-failed-card')).not.toBeVisible();

		// No confirm button (pricing suppressed once reservation exists)
		await expect(page.getByTestId('confirm-booking-button')).not.toBeVisible();
	});

	test('suppresses pricing card confirm button once reservation card is present', async ({
		page,
	}) => {
		// Simulate a turn where both get_room_pricing AND create_reservation appear
		// in the same message (edge case where the model skipped user confirmation).
		const tc1 = 'tc-pricing-x';
		const tc2 = 'tc-res-x';
		const msgId = 'mock-combined';

		const pricingResult = {
			offer: { total: { amountBeforeTax: 200, amountAfterTax: 240, currencyCode: 'USD' } },
		};
		const successResult = {
			reservations: {
				reservation: [
					{
						reservationIdList: [{ id: 'CONF-ZZZ', type: 'CONFIRMATION' }],
						roomStay: {
							arrivalDate: '2026-07-01',
							departureDate: '2026-07-03',
							roomType: 'KING',
							ratePlanCode: 'BAR',
							guestCounts: { adults: 2, children: 0 },
						},
						reservationGuests: [],
						hotelId: 'HOTEL1',
						reservationStatus: 'Reserved',
					},
				],
			},
		};

		const streamLines = [
			dsLine('f', { messageId: msgId }),
			// Pricing tool
			dsLine('b', { toolCallId: tc1, toolName: 'get_room_pricing' }),
			dsLine('g', {
				toolCallId: tc1,
				input: {
					hotelCode: 'HOTEL1',
					arrivalDate: '2026-07-01',
					departureDate: '2026-07-03',
					adults: 2,
				},
			}),
			dsLine('h', { toolCallId: tc1, output: pricingResult }),
			// Reservation tool
			dsLine('b', { toolCallId: tc2, toolName: 'create_reservation' }),
			dsLine('g', {
				toolCallId: tc2,
				input: {
					hotelId: 'HOTEL1',
					arrivalDate: '2026-07-01',
					departureDate: '2026-07-03',
					roomType: 'KING',
					ratePlanCode: 'BAR',
					guests: [{ firstName: 'Alice', lastName: 'T', adult: true }],
					email: 'a@b.com',
					phone: '555',
				},
			}),
			dsLine('h', { toolCallId: tc2, output: successResult }),
			dsLine('0', 'Your booking is confirmed.'),
			dsLine('e', { finishReason: 'stop', usage: { promptTokens: 10, completionTokens: 5 } }),
			dsLine('a', { finishReason: 'stop', usage: { promptTokens: 10, completionTokens: 5 } }),
		];

		await page.route('**/api/ai/chat', async (route) => {
			await route.fulfill(buildDataStream(streamLines));
		});

		await page.goto('/chat');
		await expect(page.getByTestId('chat-container')).toBeVisible({ timeout: 10_000 });

		await page.getByTestId('chat-textarea').fill('Book HOTEL1 KING room now');
		await page.getByTestId('chat-submit').click();

		// Confirmed card should be shown (reservation wins over pricing)
		await expect(page.getByTestId('booking-confirmed-card')).toBeVisible({ timeout: 15_000 });

		// Pricing card should be suppressed (reservation is present in same message)
		await expect(page.getByTestId('pricing-card')).not.toBeVisible();

		// No confirm button (pricing suppressed)
		await expect(page.getByTestId('confirm-booking-button')).not.toBeVisible();
	});
});
