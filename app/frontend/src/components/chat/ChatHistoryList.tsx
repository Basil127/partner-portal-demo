'use client';

import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { GetApiChatsResponse } from '@/lib/api-client';
import { ChatHistory } from './ChatHistory';

type ChatItem = NonNullable<NonNullable<GetApiChatsResponse>['chats']>[number];
type ChatHistoryData = NonNullable<GetApiChatsResponse>;

interface ChatHistoryProps {
	currentChatId: string | null;
	onSelectChat: (chatId: string) => void;
	onDeleteChat: (chatId: string) => void;
	refreshTrigger: number;
}

export function ChatHistoryList({
	currentChatId,
	onSelectChat,
	onDeleteChat,
	refreshTrigger,
}: ChatHistoryProps) {
	const [chats, setChats] = useState<ChatItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchChats = useCallback(async () => {
		try {
			const res = await fetch('/api/chat/history?limit=50&offset=0');
			if (res.ok) {
				const data: ChatHistoryData = await res.json();
				setChats(data.chats ?? []);
			}
		} catch (error) {
			console.error('Failed to fetch chat history:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchChats();
	}, [fetchChats, refreshTrigger]);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 p-3">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
				))}
			</div>
		);
	}

	if (chats.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-6 text-center">
				<MessageSquare className="mb-2 size-8 text-gray-300 dark:text-gray-600" />
				<p className="text-sm text-gray-500 dark:text-gray-400">No chat history yet</p>
				<p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Start a new conversation</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 p-2" data-testid="chat-history">
			{chats.map((chat) => (
				<ChatHistory
					chat={chat}
					onSelectChat={onSelectChat}
					onDeleteChat={onDeleteChat}
					setChats={setChats}
					isSelectedChat={chat.id === currentChatId}
					key={chat.id}
				/>
			))}
		</div>
	);
}
