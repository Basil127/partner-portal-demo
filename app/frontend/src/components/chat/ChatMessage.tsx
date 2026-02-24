'use client';

import type { UIMessage } from 'ai';
import { Bot, User, Sparkle } from 'lucide-react';
import { ChatMarkdown } from './ChatMarkdown';
import { MessageActions } from './MessageActions';
import { BookingCard } from './BookingCard';

interface PreviewMessageProps {
	message: UIMessage;
	isLoading: boolean;
	sendMessage?: (msg: { text: string }) => void;
}

/** Tool names that get a special card UI — everything else shows a generic tool badge. */
const BOOKING_TOOL_NAMES = new Set(['create_reservation', 'get_room_pricing']); // compare_room_prices intentionally NOT in the set — it renders as a compact generic badge

/**
 * Strip the model's internal reasoning markers from text before displaying.
 * The model emits chain-of-thought inline using: analysis, assistantcommentary, assistantfinal.
 *
 *  1. If "assistantfinal" is present → keep only what comes after the last one.
 *  2. If thinking markers present but no "assistantfinal" → still streaming reasoning; hide.
 *  3. Otherwise → strip bare assistant/marker words that leaked through.
 */
const THINKING_MARKER_RE = /\b(assistantfinal|assistantcommentary|assistant)\b/gi;

function stripThinkingTokens(text: string): string {
	const finalMarker = 'assistantfinal';
	const finalIdx = text.lastIndexOf(finalMarker);
	if (finalIdx !== -1) {
		const after = text.slice(finalIdx + finalMarker.length).trimStart();
		return after
			.replace(THINKING_MARKER_RE, '')
			.replace(/\s{2,}/g, ' ')
			.trim();
	}
	if (text.includes('analysis') || text.includes('assistantcommentary')) {
		return '';
	}
	return text
		.replace(THINKING_MARKER_RE, '')
		.replace(/\s{2,}/g, ' ')
		.trim();
}
/** Renders a generic tool invocation row (non-booking tools). */
function GenericToolRow({ part }: { part: any }) {
	const toolName: string = part.toolName ?? part.type?.replace(/^tool-/, '') ?? '';
	const state: string = part.state ?? 'call';
	const partOutput = part.output ?? part.result;
	const outputIsErrorText =
		partOutput && typeof partOutput === 'object' && partOutput.type === 'error-text';
	const isError: boolean = part.isError || state === 'output-error' || outputIsErrorText;

	return (
		<div className="tool-badge-enter flex w-full items-center gap-3 justify-start mb-2">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:ring-brand-700">
				<Bot className="size-4 text-brand-600 dark:text-brand-400" />
			</div>
			<div
				className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-200 ${
					isError
						? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
						: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
				}`}
			>
				<Sparkle className="size-3 shrink-0" />
				<span
					className={`font-medium 
					${state === 'input-streaming' ? 'animate-pulse' : ''}`}
				>
					{toolName}
				</span>
				{state === 'input-streaming' || state === 'call' ? (
					<span className="italic opacity-60">(calling)</span>
				) : isError ? (
					<span className="italic opacity-60">(error)</span>
				) : (
					<span className="italic opacity-60">(success)</span>
				)}
			</div>
		</div>
	);
}

/** Renders a booking tool: either a dedicated card or a generic row. */
function ToolPart({
	part,
	sendMessage,
}: {
	part: any;
	sendMessage?: (msg: { text: string }) => void;
}) {
	const toolName: string = part.toolName ?? part.type?.replace(/^tool-/, '') ?? '';
	const state: string = part.state ?? 'call';
	const args = part.input ?? part.args;
	const rawOutput = part.output ?? part.result;
	const isError: boolean = part.isError ?? false;

	// AI SDK wraps tool outputs as { type: "json", value: <data> } or
	// { type: "error-text", value: <error_string> }. Unwrap so downstream
	// components (BookingCard etc.) receive the actual payload.
	let result: any = rawOutput;
	let outputIsError = false;
	if (rawOutput && typeof rawOutput === 'object' && 'type' in rawOutput && 'value' in rawOutput) {
		result = rawOutput.value;
		outputIsError = rawOutput.type === 'error-text';
	}

	const cardState: 'call' | 'result' | 'partial-call' =
		state === 'output-available'
			? 'result'
			: state === 'output-error'
				? 'result'
				: state === 'input-streaming'
					? 'partial-call'
					: 'call';

	const effectiveIsError = isError || state === 'output-error' || outputIsError;

	return (
		<BookingCard
			toolName={toolName}
			state={cardState}
			args={args}
			result={result}
			isError={effectiveIsError}
			sendMessage={sendMessage}
		/>
	);
}

export function PreviewMessage({ message, isLoading, sendMessage }: PreviewMessageProps) {
	const parts = message.parts ?? [];

	// Bucket parts into three categories (preserving source order via index)
	const genericToolParts: Array<{ index: number; part: any }> = [];
	const bookingToolParts: Array<{ index: number; part: any }> = [];
	const textParts: Array<{ index: number; part: any }> = [];

	// Track whether we've already routed one errored create_reservation to a card.
	// Subsequent failures are silently dropped so at most one failure card is shown.
	let firstErroredReservationAdded = false;

	parts.forEach((p: any, i: number) => {
		if (p.type && p.type.startsWith('tool-')) {
			const toolName: string = p.toolName ?? p.type?.replace(/^tool-/, '') ?? 'tool';
			if (BOOKING_TOOL_NAMES.has(toolName)) {
				const partState: string = p.state ?? 'call';
				const partOutput = p.output ?? p.result;
				const outputIsErrorText =
					partOutput && typeof partOutput === 'object' && partOutput.type === 'error-text';
				const partIsError = p.isError || partState === 'output-error' || outputIsErrorText;
				if (partIsError) {
					if (toolName === 'create_reservation') {
						// Show the first failure as a full BookingFailedCard; suppress duplicates.
						if (!firstErroredReservationAdded) {
							firstErroredReservationAdded = true;
							bookingToolParts.push({ index: i, part: p });
						}
					} else {
						// Other failing booking tools (e.g. get_room_pricing) → compact badge
						genericToolParts.push({ index: i, part: p });
					}
				} else {
					bookingToolParts.push({ index: i, part: p });
				}
			} else {
				genericToolParts.push({ index: i, part: p });
			}
		} else if (p.type === 'text') {
			textParts.push({ index: i, part: p });
		}
	});

	// ── Deduplicate booking parts ──────────────────────────────────────────────
	// • If any create_reservation card is present (success or failure), suppress
	//   all get_room_pricing cards — the "Confirm Booking" button is no longer
	//   relevant once a reservation attempt has been made.
	// • If multiple get_room_pricing cards are present (model retried pricing),
	//   show only the last one — it has the most up-to-date information.
	// • If multiple create_reservation cards somehow exist, show only the last.
	const hasReservationCard = bookingToolParts.some(
		({ part: p }) => (p.toolName ?? p.type?.replace(/^tool-/, '')) === 'create_reservation',
	);
	const visibleBookingParts: Array<{ index: number; part: any }> = hasReservationCard
		? // Show only the last (or only) reservation card
			bookingToolParts
				.filter(
					({ part: p }) => (p.toolName ?? p.type?.replace(/^tool-/, '')) === 'create_reservation',
				)
				.slice(-1)
		: // No reservation yet — show only the last pricing card (most accurate)
			bookingToolParts
				.filter(
					({ part: p }) => (p.toolName ?? p.type?.replace(/^tool-/, '')) === 'get_room_pricing',
				)
				.slice(-1);

	const fallbackContent =
		parts.length === 0 && typeof (message as any).content === 'string'
			? (message as any).content
			: null;

	// Strip reasoning markers during streaming; once final marker appears, show only what follows.
	const hasTextContent =
		message.role === 'assistant'
			? textParts.some(({ part: p }) => !!stripThinkingTokens(p.text))
			: textParts.length > 0;
	const hasAnyVisibleContent =
		hasTextContent ||
		fallbackContent ||
		visibleBookingParts.length > 0 ||
		genericToolParts.length > 0;

	if (!hasAnyVisibleContent) return null;

	return (
		<div
			className="chat-message-enter group w-full"
			data-role={message.role}
			data-testid={`message-${message.role}`}
		>
			{/* Generic tool rows — each gets its own line with bot avatar */}
			{message.role === 'assistant' &&
				genericToolParts.map(({ index, part }) => (
					<GenericToolRow key={part.toolCallId ?? index} part={part} />
				))}

			{/* Booking tool card — deduplicated to one visible card at a time */}
			{visibleBookingParts.map(({ index, part }) => (
				<div
					key={part.toolCallId ?? index}
					className="flex w-full items-start gap-3 justify-start mb-3"
				>
					<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:ring-brand-700">
						<Bot className="size-4 text-brand-600 dark:text-brand-400" />
					</div>
					<div className="max-w-[80%] min-w-0 flex-1">
						<ToolPart part={part} sendMessage={sendMessage} />
					</div>
				</div>
			))}

			{/* Text bubble */}
			{(hasTextContent || fallbackContent) && (
				<div
					className={`flex w-full items-start gap-3 ${
						message.role === 'user' ? 'justify-end' : 'justify-start'
					}`}
				>
					{message.role === 'assistant' && (
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:ring-brand-700">
							<Bot className="size-4 text-brand-600 dark:text-brand-400" />
						</div>
					)}

					<div
						className={`flex max-w-[80%] flex-col ${
							message.role === 'user' ? 'items-end' : 'items-start'
						}`}
					>
						<div
							className={`rounded-2xl px-4 py-2.5 text-sm ${
								message.role === 'user'
									? 'bg-brand-600 text-white dark:bg-brand-300'
									: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
							}`}
						>
							{textParts.map(({ index, part: p }) => {
								const displayText =
									message.role === 'assistant' ? stripThinkingTokens(p.text) : p.text;
								if (!displayText) return null;
								return (
									<div key={index}>
										{message.role === 'user' ? (
											<p className="whitespace-pre-wrap">{displayText}</p>
										) : (
											<div
												className={`prose prose-sm dark:prose-invert max-w-prose${isLoading ? ' streaming-cursor' : ''}`}
											>
												<ChatMarkdown content={displayText} />
											</div>
										)}
									</div>
								);
							})}
							{fallbackContent &&
								(message.role === 'user' ? (
									<p className="whitespace-pre-wrap">{fallbackContent}</p>
								) : (
									<div className="prose prose-sm dark:prose-invert max-w-prose">
										<ChatMarkdown content={stripThinkingTokens(fallbackContent)} />
									</div>
								))}
						</div>

						{message.role === 'assistant' && !isLoading && <MessageActions message={message} />}
					</div>

					{message.role === 'user' && (
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
							<User className="size-4 text-gray-600 dark:text-gray-400" />
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export function ThinkingMessage() {
	return (
		<div className="flex w-full items-start gap-3" data-testid="thinking-message">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:ring-brand-700">
				<Bot className="size-4 text-brand-600 dark:text-brand-400" />
			</div>
			<div className="rounded-2xl bg-gray-100 px-4 py-2.5 dark:bg-gray-800">
				<div className="flex items-center gap-1.5">
					<div className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
					<div className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
					<div className="size-2 animate-bounce rounded-full bg-gray-400" />
				</div>
			</div>
		</div>
	);
}
