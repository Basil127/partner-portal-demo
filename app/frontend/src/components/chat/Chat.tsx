'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useCallback, useMemo, useState } from 'react';
// import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';

interface ChatProps {
	id: string;
	initialMessages?: UIMessage[];
	onNewChat?: () => void;
	onMessageSent?: () => void;
}

export function Chat({ id, initialMessages = [], onMessageSent }: ChatProps) {
	const [input, setInput] = useState('');

	const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

	const transport = useMemo(
		() => new DefaultChatTransport({ api: `${apiUrl}/api/ai/chat`, body: { id } }),
		[id, apiUrl],
	);

	const { messages, sendMessage, status, stop } = useChat({
		id,
		transport,
		messages: initialMessages,
		onFinish: () => {
			onMessageSent?.();
		},
	});

	const submitMessage = useCallback(() => {
		const text = input.trim();
		if (!text) return;
		setInput('');
		sendMessage({ text });
		onMessageSent?.();
	}, [input, sendMessage, onMessageSent]);

	return (
		<>
			<div className="flex h-full flex-col" data-testid="chat-container">
				{/* <ChatHeader onNewChat={onNewChat} onOpenHistory={onOpenHistory} /> */}
				<ChatMessages messages={messages} status={status} />
				<ChatInput
					input={input}
					setInput={setInput}
					onSubmit={submitMessage}
					status={status}
					stop={stop}
				/>
			</div>
		</>
	);
}
