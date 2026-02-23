'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chat, ChatHistoryModal } from '@/components/chat';
import { useChatContext } from '@/context/ChatContext';

function generateUUID(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	// Fallback for non-secure (HTTP) contexts
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export default function ChatPage() {
	const router = useRouter();
	const [chatId, setChatId] = useState(() => generateUUID());
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const { isHistoryOpen, closeHistory, setNewChatHandler } = useChatContext();

	const handleNewChat = useCallback(() => {
		setChatId(generateUUID());

		closeHistory();
	}, [closeHistory]);

	useEffect(() => {
		setNewChatHandler(handleNewChat);
	}, [handleNewChat, setNewChatHandler]);

	const handleSelectChat = useCallback(
		(id: string) => {
			closeHistory();
			router.push(`/chat/${id}`);
		},
		[router, closeHistory],
	);

	const handleDeleteChat = useCallback(
		(deletedId: string) => {
			if (deletedId === chatId) {
				handleNewChat();
			}
		},
		[chatId, handleNewChat],
	);

	const handleMessageSent = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1);
	}, []);

	return (
		<>
			<div className="h-[calc(100vh-90px)]">
				{/* <div className="flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3"> */}
				<div className="flex-1 h-full">
					<Chat id={chatId} onNewChat={handleNewChat} onMessageSent={handleMessageSent} />
				</div>
				{/* </div> */}
			</div>

			<ChatHistoryModal
				currentChatId={chatId}
				onSelectChat={handleSelectChat}
				onDeleteChat={handleDeleteChat}
				refreshTrigger={refreshTrigger}
				isOpen={isHistoryOpen}
				onClose={closeHistory}
			/>
		</>
	);
}
