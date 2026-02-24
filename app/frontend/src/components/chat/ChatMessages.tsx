'use client';

import type { UIMessage } from 'ai';
import { ArrowDown } from 'lucide-react';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { ChatGreeting } from './ChatGreeting';
import { PreviewMessage, ThinkingMessage } from './ChatMessage';

interface ChatMessagesProps {
	messages: UIMessage[];
	status: string;
	sendMessage?: (msg: { text: string }) => void;
}

export function ChatMessages({ messages, status, sendMessage }: ChatMessagesProps) {
	const { containerRef, endRef, isAtBottom, scrollToBottom } = useChatMessages({
		status,
	});

	// Deduplicate messages by id before rendering.
	// During multi-step AI SDK streaming, the same message id can appear more than
	// once in the array (one entry per step that is still being streamed). The later
	// entry always has more complete data, so we keep the last occurrence of each id.
	const seenIds = new Map<string, number>();
	messages.forEach((msg, i) => seenIds.set(msg.id, i));
	const dedupedMessages = messages.filter((msg, i) => seenIds.get(msg.id) === i);

	return (
		<div className="relative flex-1">
			<div className="absolute inset-0 overflow-y-auto scroll-smooth" ref={containerRef}>
				<div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-4 md:gap-6">
					{dedupedMessages.length === 0 && <ChatGreeting />}

					{dedupedMessages.map((message, index) => (
						<PreviewMessage
							key={message.id}
							message={message}
							isLoading={status === 'streaming' && dedupedMessages.length - 1 === index}
							sendMessage={sendMessage}
						/>
					))}

					{status === 'submitted' && <ThinkingMessage />}

					<div className="min-h-[24px] min-w-[24px] shrink-0" ref={endRef} />
				</div>
			</div>

			<button
				aria-label="Scroll to bottom"
				className={`absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-lg transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${
					isAtBottom
						? 'pointer-events-none scale-0 opacity-0'
						: 'pointer-events-auto scale-100 opacity-100'
				}`}
				onClick={() => scrollToBottom('smooth')}
				type="button"
			>
				<ArrowDown className="size-4" />
			</button>
		</div>
	);
}
