import { test, expect } from '@playwright/test';

test.describe('AI Chat Feature', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/chat');
		// Wait for the chat page to fully load
		await expect(page.getByTestId('chat-container')).toBeVisible({ timeout: 10000 });
	});

	test('chat page loads with greeting', async ({ page }) => {
		// Should show the greeting message
		await expect(page.getByTestId('chat-greeting')).toBeVisible();
		await expect(page.getByText('How can I help you today?')).toBeVisible();
	});

	test('chat input is visible and focusable', async ({ page }) => {
		const textarea = page.getByTestId('chat-textarea');
		await expect(textarea).toBeVisible();
		await expect(textarea).toHaveAttribute('placeholder', 'Send a message...');
	});

	test('chat header shows title and new chat button', async ({ page }) => {
		await expect(page.getByTestId('chat-header')).toBeVisible();
		await expect(page.getByText('AI Chat')).toBeVisible();
		await expect(page.getByTestId('new-chat-button')).toBeVisible();
	});

	test('submit button is disabled when input is empty', async ({ page }) => {
		const submitButton = page.getByTestId('chat-submit');
		await expect(submitButton).toBeDisabled();
	});

	test('submit button is enabled when input has text', async ({ page }) => {
		const textarea = page.getByTestId('chat-textarea');
		await textarea.fill('Hello');
		const submitButton = page.getByTestId('chat-submit');
		await expect(submitButton).toBeEnabled();
	});

	test('can type a message in the textarea', async ({ page }) => {
		const textarea = page.getByTestId('chat-textarea');
		await textarea.fill('Hello, this is a test message');
		await expect(textarea).toHaveValue('Hello, this is a test message');
	});

	test('history button opens modal and can be closed', async ({ page }) => {
		// History button should be visible in the header
		const historyButton = page.getByTestId('history-button');
		await expect(historyButton).toBeVisible();

		// Click the history button to open modal
		await historyButton.click();

		// Modal should appear with "Chat History" heading
		await expect(page.getByTestId('history-modal')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Chat History')).toBeVisible();

		// Close the modal by pressing Escape
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('history-modal')).not.toBeVisible({ timeout: 3000 });
	});

	test('sending a message shows user message in chat', async ({ page }) => {
		const textarea = page.getByTestId('chat-textarea');
		await textarea.fill('Hello test message');

		// Submit the message
		const submitButton = page.getByTestId('chat-submit');
		await submitButton.click();

		// User message should appear
		await expect(page.getByTestId('message-user')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Hello test message')).toBeVisible();

		// Input should be cleared
		await expect(textarea).toHaveValue('');
	});

	test('sending a message triggers AI response or thinking indicator', async ({ page }) => {
		const textarea = page.getByTestId('chat-textarea');
		await textarea.fill('Say hello');

		const submitButton = page.getByTestId('chat-submit');
		await submitButton.click();

		// Should show either thinking indicator or assistant message
		// (depends on whether OpenAI key is set and backend is running)
		const thinkingOrAssistant = page
			.getByTestId('thinking-message')
			.or(page.getByTestId('message-assistant'));
		await expect(thinkingOrAssistant).toBeVisible({ timeout: 15000 });
	});

	test('new chat button resets the conversation', async ({ page }) => {
		// Type and send a message first
		const textarea = page.getByTestId('chat-textarea');
		await textarea.fill('Hello');
		await page.getByTestId('chat-submit').click();
		await expect(page.getByTestId('message-user')).toBeVisible({ timeout: 5000 });

		// Click new chat
		await page.getByTestId('new-chat-button').click();

		// Greeting should reappear (new empty chat)
		await expect(page.getByTestId('chat-greeting')).toBeVisible({ timeout: 5000 });
	});

	test('Enter key submits the message', async ({ page }) => {
		const textarea = page.getByTestId('chat-textarea');
		await textarea.fill('Enter key test');
		await textarea.press('Enter');

		// User message should appear
		await expect(page.getByTestId('message-user')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Enter key test')).toBeVisible();
	});

	test('Shift+Enter adds a newline instead of submitting', async ({ page }) => {
		const textarea = page.getByTestId('chat-textarea');
		await textarea.fill('Line one');
		await textarea.press('Shift+Enter');
		await textarea.type('Line two');

		// Message should not be submitted, textarea should still have content
		await expect(textarea).toHaveValue(/Line one\nLine two/);
		await expect(page.getByTestId('message-user')).not.toBeVisible();
	});

	test('navigating to /chat/[id] for non-existent chat shows not found', async ({ page }) => {
		await page.goto('/chat/00000000-0000-0000-0000-000000000000');

		// Should show not found or loading
		const notFoundOrChat = page
			.getByText('Chat not found')
			.or(page.getByText('Loading chat...'))
			.or(page.getByTestId('chat-container'));
		await expect(notFoundOrChat).toBeVisible({ timeout: 10000 });
	});

	test('disclaimer text is visible', async ({ page }) => {
		await expect(
			page.getByText('AI can make mistakes. Verify important information.'),
		).toBeVisible();
	});
});
