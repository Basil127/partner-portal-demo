'use client';

import type { UIMessage } from 'ai';
import { ArrowDown } from 'lucide-react';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { ChatGreeting } from './ChatGreeting';
import { PreviewMessage, ThinkingMessage } from './ChatMessage';

interface ChatMessagesProps {
	messages: UIMessage[];
	status: string;
}

export function ChatMessages({ messages, status }: ChatMessagesProps) {
	const { containerRef, endRef, isAtBottom, scrollToBottom, hasSentMessage } = useChatMessages({
		status,
	});

	return (
		<div className="relative flex-1">
			<div className="absolute inset-0 overflow-y-auto" ref={containerRef}>
				<div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-4 py-4 md:gap-6">
					{messages.length === 0 && <ChatGreeting />}

					{messages.map((message, index) => (
						<PreviewMessage
							key={message.id}
							message={message}
							isLoading={status === 'streaming' && messages.length - 1 === index}
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
