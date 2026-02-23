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

/** Tool names that get a special card UI â€” everything else shows a generic tool badge. */
const BOOKING_TOOL_NAMES = new Set(['create_reservation', 'get_room_pricing']);

/**
 * Strip internal model reasoning tokens that leak into displayed text.
 * The model sometimes wraps chain-of-thought with "analysis" / "assistantfinal" markers.
 * We only show the content after the last "assistantfinal" marker.
 */
function stripThinkingTokens(text: string): string {
	const marker = 'assistantfinal';
	const idx = text.lastIndexOf(marker);
	if (idx !== -1) {
		return text.slice(idx + marker.length).trimStart();
	}
	return text;
}

/** Renders a generic tool invocation row (non-booking tools). */
function GenericToolRow({ part }: { part: any }) {
	const toolName: string = part.toolName ?? part.type?.replace(/^tool-/, '') ?? '';
	const state: string = part.state ?? 'call';
	const isError: boolean = part.isError || state === 'output-error';

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
	const result = part.output ?? part.result;
	const isError: boolean = part.isError ?? false;

	const cardState: 'call' | 'result' | 'partial-call' =
		state === 'output-available'
			? 'result'
			: state === 'output-error'
				? 'result'
				: state === 'input-streaming'
					? 'partial-call'
					: 'call';

	const effectiveIsError = isError || state === 'output-error';

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

	parts.forEach((p: any, i: number) => {
		if (p.type && p.type.startsWith('tool-')) {
			const toolName: string = p.toolName ?? p.type?.replace(/^tool-/, '') ?? '';
			if (BOOKING_TOOL_NAMES.has(toolName)) {
				bookingToolParts.push({ index: i, part: p });
			} else {
				genericToolParts.push({ index: i, part: p });
			}
		} else if (p.type === 'text') {
			textParts.push({ index: i, part: p });
		}
	});

	const fallbackContent =
		parts.length === 0 && typeof (message as any).content === 'string'
			? (message as any).content
			: null;

	const hasTextContent = textParts.length > 0;
	const hasAnyVisibleContent =
		hasTextContent || fallbackContent || bookingToolParts.length > 0 || genericToolParts.length > 0;

	if (!hasAnyVisibleContent) return null;

	return (
		<div
			className="chat-message-enter group w-full"
			data-role={message.role}
			data-testid={`message-${message.role}`}
		>
			{/* Generic tool rows â€” each gets its own line with bot avatar */}
			{message.role === 'assistant' &&
				genericToolParts.map(({ index, part }) => <GenericToolRow key={index} part={part} />)}

			{/* Booking tool cards â€” full-width with bot avatar */}
			{bookingToolParts.map(({ index, part }) => (
				<div key={index} className="flex w-full items-start gap-3 justify-start mb-3">
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
