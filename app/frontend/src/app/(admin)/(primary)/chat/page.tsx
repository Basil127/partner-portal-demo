'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chat, ChatHistory } from '@/components/chat';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';

function generateUUID(): string {
	return crypto.randomUUID();
}

export default function ChatPage() {
	const router = useRouter();
	const [chatId, setChatId] = useState(() => generateUUID());
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const { isOpen: historyOpen, openModal: openHistory, closeModal: closeHistory } = useModal();

	const handleNewChat = useCallback(() => {
		setChatId(generateUUID());
		closeHistory();
	}, [closeHistory]);

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
			<div className="h-[calc(100vh-130px)]">
				<div className="flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
					<div className="flex-1">
						<Chat
							id={chatId}
							onNewChat={handleNewChat}
							onMessageSent={handleMessageSent}
							onOpenHistory={openHistory}
						/>
					</div>
				</div>
			</div>

			<Modal isOpen={historyOpen} onClose={closeHistory} className="max-w-md p-6 top-[-50vh]">
				<div data-testid="history-modal">
					<h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Chat History</h3>
					<div className="max-h-[60vh] overflow-y-auto">
						<ChatHistory
							currentChatId={chatId}
							onSelectChat={handleSelectChat}
							onDeleteChat={handleDeleteChat}
							refreshTrigger={refreshTrigger}
						/>
					</div>
				</div>
			</Modal>
		</>
	);
}
