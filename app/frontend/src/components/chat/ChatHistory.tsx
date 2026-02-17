'use client';

import { MessageSquare, Trash2, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Chat, ChatHistoryResponse } from '@/lib/chat/types';

interface ChatHistoryProps {
	currentChatId: string | null;
	onSelectChat: (chatId: string) => void;
	onDeleteChat: (chatId: string) => void;
	refreshTrigger: number;
}

export function ChatHistory({ currentChatId, onSelectChat, onDeleteChat, refreshTrigger }: ChatHistoryProps) {
	const [chats, setChats] = useState<Chat[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchChats = useCallback(async () => {
		try {
			const res = await fetch('/api/chat/history?limit=50&offset=0');
			if (res.ok) {
				const data: ChatHistoryResponse = await res.json();
				setChats(data.chats);
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

	const handleDelete = async (e: React.MouseEvent, chatId: string) => {
		e.stopPropagation();
		try {
			const res = await fetch(`/api/chat/history?id=${chatId}`, { method: 'DELETE' });
			if (res.ok || res.status === 204) {
				setChats((prev) => prev.filter((c) => c.id !== chatId));
				onDeleteChat(chatId);
			}
		} catch (error) {
			console.error('Failed to delete chat:', error);
		}
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

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
				<button
					key={chat.id}
					onClick={() => onSelectChat(chat.id)}
					className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
						currentChatId === chat.id
							? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
							: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
					}`}
					type="button"
					data-testid={`chat-history-item-${chat.id}`}
				>
					<MessageSquare className="size-4 shrink-0" />
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">{chat.title}</p>
						<p className="flex items-center gap-1 text-xs opacity-60">
							<Clock className="size-3" />
							{formatDate(chat.updatedAt)}
						</p>
					</div>
					<div
						onClick={(e) => handleDelete(e, chat.id)}
						className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/30"
						title="Delete chat"
						data-testid={`delete-chat-${chat.id}`}
					>
						<Trash2 className="size-3.5" />
					</div>
				</button>
			))}
		</div>
	);
}
