'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { UIMessage } from 'ai';
import { Chat, ChatHistory } from '@/components/chat';
import { useChatContext } from '@/context/ChatContext';
import { getApiChatsById } from '@/lib/api-client';

/**
 * Resolve corrupted session-storage message arrays:
 * 1. Deduplicate by message ID — keep the last copy (most parts / most complete).
 * 2. Clamp any tool parts that are still "in-flight" (input-streaming / call)
 *    to an error state so they don't render as permanently-pending cards.
 */
function sanitizeStoredMessages(messages: UIMessage[]): UIMessage[] {
	// Keep last occurrence of each ID
	const seen = new Map<string, UIMessage>();
	for (const msg of messages) {
		seen.set(msg.id, msg);
	}
	const deduped = Array.from(seen.values());

	// Fix stale tool parts
	return deduped.map((msg) => {
		if (!msg.parts) return msg;
		const fixedParts = msg.parts.map((part: any) => {
			if (!part.type?.startsWith('tool-')) return part;
			const s = part.state;
			// These states mean the stream was cut off — treat as error
			if (s === 'call' || s === 'input-streaming') {
				return { ...part, state: 'output-error', isError: true };
			}
			return part;
		});
		return { ...msg, parts: fixedParts };
	});
}

export default function ChatByIdPage() {
	const params = useParams();
	const router = useRouter();
	const chatId = params.id as string;
	const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const { isHistoryOpen, closeHistory, setNewChatHandler } = useChatContext();

	useEffect(() => {
		async function loadChat() {
			try {
				// First try to restore full messages (with tool parts) from sessionStorage
				const stored = sessionStorage.getItem(`chat-messages-${chatId}`);
				if (stored) {
					const parsed = JSON.parse(stored) as UIMessage[];
					if (parsed.length > 0) {
						// Deduplicate by ID (keep last occurrence — most up-to-date parts)
						// and fix any stale pending tool parts that can never be resolved.
						const deduped = sanitizeStoredMessages(parsed);
						setInitialMessages(deduped);
						setIsLoading(false);
						return;
					}
				}

				const { data, error } = await getApiChatsById({
					path: { id: chatId },
				});
				if (error || !data) {
					setNotFound(true);
					return;
				}
				const uiMessages: UIMessage[] = (data.messages ?? []).map((m) => ({
					id: m.id ?? '',
					role: (m.role ?? 'user') as UIMessage['role'],
					parts: [{ type: 'text' as const, text: m.content ?? '' }],
				}));
				setInitialMessages(uiMessages);
			} catch (err) {
				console.error('Failed to load chat:', err);
				setNotFound(true);
			} finally {
				setIsLoading(false);
			}
		}

		loadChat();
	}, [chatId]);

	const handleNewChat = useCallback(() => {
		closeHistory();
		router.push('/chat');
	}, [router, closeHistory]);

	useEffect(() => {
		setNewChatHandler(handleNewChat);
	}, [handleNewChat, setNewChatHandler]);

	const handleSelectChat = useCallback(
		(id: string) => {
			if (id !== chatId) {
				closeHistory();
				router.push(`/chat/${id}`);
			}
		},
		[chatId, router, closeHistory],
	);

	const handleDeleteChat = useCallback(
		(deletedId: string) => {
			if (deletedId === chatId) {
				router.push('/chat');
			}
		},
		[chatId, router],
	);

	const handleMessageSent = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1);
	}, []);

	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-130px)] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
				<div className="flex flex-col items-center gap-3">
					<div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
					<p className="text-sm text-gray-500">Loading chat...</p>
				</div>
			</div>
		);
	}

	if (notFound) {
		return (
			<div className="flex h-[calc(100vh-130px)] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
				<div className="text-center">
					<h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
						Chat not found
					</h3>
					<p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
						This chat may have been deleted.
					</p>
					<button
						onClick={handleNewChat}
						className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
						type="button"
					>
						Start a new chat
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="h-[calc(100vh-120px)]">
				{/* <div className="flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3"> */}
				<div className="flex-1 h-full">
					<Chat
						id={chatId}
						initialMessages={initialMessages}
						onNewChat={handleNewChat}
						onMessageSent={handleMessageSent}
					/>
				</div>
				{/* </div> */}
			</div>
			<ChatHistory
				isOpen={isHistoryOpen}
				onClose={closeHistory}
				currentChatId={chatId}
				onSelectChat={handleSelectChat}
				onDeleteChat={handleDeleteChat}
				refreshTrigger={refreshTrigger}
			/>
		</>
	);
}
