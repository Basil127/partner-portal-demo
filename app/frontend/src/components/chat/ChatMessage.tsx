'use client';

import type { UIMessage } from 'ai';
import { Bot, User } from 'lucide-react';
import { ChatMarkdown } from './ChatMarkdown';
import { MessageActions } from './MessageActions';

interface PreviewMessageProps {
	message: UIMessage;
	isLoading: boolean;
}

export function PreviewMessage({ message, isLoading }: PreviewMessageProps) {
	const textContent = message.parts
		?.filter((p) => p.type === 'text')
		.map((p) => p.text)
		.join('\n') || '';

	return (
		<div className="group w-full" data-role={message.role} data-testid={`message-${message.role}`}>
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
								? 'bg-brand-600 text-white dark:bg-brand-500'
								: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
						}`}
					>
						{message.role === 'user' ? (
							<p className="whitespace-pre-wrap">{textContent}</p>
						) : (
							<div className="prose prose-sm dark:prose-invert max-w-prose">
								<ChatMarkdown content={textContent} />
							</div>
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
