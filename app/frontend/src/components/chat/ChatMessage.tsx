'use client';

import type { UIMessage } from 'ai';
import { Bot, User, Wrench } from 'lucide-react';
import { ChatMarkdown } from './ChatMarkdown';
import { MessageActions } from './MessageActions';
import { BookingCard } from './BookingCard';

interface PreviewMessageProps {
	message: UIMessage;
	isLoading: boolean;
	sendMessage?: (msg: { text: string }) => void;
}

/** Tool names that get a special card UI — everything else shows a generic tool badge. */
const BOOKING_TOOL_NAMES = new Set(['create_reservation', 'get_room_pricing']);

/** Renders a tool invocation: either a booking card or a generic badge. */
function ToolPart({ part, sendMessage }: { part: any; sendMessage?: (msg: { text: string }) => void }) {
	// AI SDK v6: tool parts have type "tool-{toolName}", with `input`/`output` fields
	const toolName: string = part.toolName ?? part.type?.replace(/^tool-/, '') ?? '';
	const state: string = part.state ?? 'call';
	// AI SDK v6 uses `input`/`output`; v5 uses `args`/`result`
	const args = part.input ?? part.args;
	const result = part.output ?? part.result;

	// Map AI SDK v6 states to our card states
	const cardState: 'call' | 'result' | 'partial-call' =
		state === 'output-available' ? 'result' :
		state === 'input-streaming' ? 'partial-call' :
		'call';

	// Booking / pricing — dedicated full-width card
	if (BOOKING_TOOL_NAMES.has(toolName)) {
		return (
			<BookingCard
				toolName={toolName}
				state={cardState}
				args={args}
				result={result}
				sendMessage={sendMessage}
			/>
		);
	}

	// Other tools — generic pill badge (stays inline)
	return (
		<div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 my-1 text-xs text-gray-600 dark:text-gray-400 max-w-full">
			<Wrench className="size-3 shrink-0" />
			<span className="font-medium">{toolName}</span>
			{state !== 'output-available' && (
				<span className="text-gray-400 dark:text-gray-500 italic">(calling…)</span>
			)}
			{state === 'output-available' && result != null && (
				<span className="text-gray-400 dark:text-gray-500 truncate max-w-50">
					→ {typeof result === 'string' ? result : JSON.stringify(result).slice(0, 80)}
				</span>
			)}
		</div>
	);
}

export function PreviewMessage({ message, isLoading, sendMessage }: PreviewMessageProps) {
	const parts = message.parts ?? [];

	// Separate text parts (stay in bubble) from booking tool parts (rendered outside bubble at full width)
	const textAndGenericParts: Array<{ index: number; part: any }> = [];
	const bookingToolParts: Array<{ index: number; part: any }> = [];

	parts.forEach((p: any, i: number) => {
		if (p.type && p.type.startsWith('tool-')) {
			const toolName: string = p.toolName ?? p.type?.replace(/^tool-/, '') ?? '';
			if (BOOKING_TOOL_NAMES.has(toolName)) {
				bookingToolParts.push({ index: i, part: p });
			} else {
				textAndGenericParts.push({ index: i, part: p });
			}
		} else {
			textAndGenericParts.push({ index: i, part: p });
		}
	});

	// Fallback: if message has no parts but has content, treat as text
	const hasTextContent = textAndGenericParts.some(Boolean);
	const fallbackContent =
		!hasTextContent && typeof (message as any).content === 'string'
			? (message as any).content
			: null;
	const hasAnyVisibleContent = hasTextContent || fallbackContent || bookingToolParts.length > 0;

	if (!hasAnyVisibleContent) return null;

	return (
		<div className="group w-full" data-role={message.role} data-testid={`message-${message.role}`}>
			{/* Booking tool cards — full width, outside any bubble */}
			{bookingToolParts.map(({ index, part }) => (
				<div key={index} className="w-full mb-3">
					<ToolPart part={part} sendMessage={sendMessage} />
				</div>
			))}

			{/* Text / generic tool badges — inside message bubble */}
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
							{textAndGenericParts.map(({ index, part: p }) => {
								if (p.type === 'text') {
									return (
										<div key={index}>
											{message.role === 'user' ? (
												<p className="whitespace-pre-wrap">{p.text}</p>
											) : (
												<div className="prose prose-sm dark:prose-invert max-w-prose">
													<ChatMarkdown content={p.text} />
												</div>
											)}
										</div>
									);
								}
								// Generic tool badge
								if (p.type && p.type.startsWith('tool-')) {
									return <ToolPart key={index} part={p} sendMessage={sendMessage} />;
								}
								return null;
							})}
							{fallbackContent && (
								message.role === 'user' ? (
									<p className="whitespace-pre-wrap">{fallbackContent}</p>
								) : (
									<div className="prose prose-sm dark:prose-invert max-w-prose">
										<ChatMarkdown content={fallbackContent} />
									</div>
								)
							)}
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
