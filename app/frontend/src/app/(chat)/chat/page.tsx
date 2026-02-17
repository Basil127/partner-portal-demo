'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chat, ChatHistory } from '@/components/chat';
import { useChatContext } from '@/context/ChatContext';

function generateUUID(): string {
	return crypto.randomUUID();
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
