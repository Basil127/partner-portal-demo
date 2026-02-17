import { ChatHistoryList } from './ChatHistoryList';
import { Modal } from '@/components/ui/modal';

interface ChatHistoryProps {
	currentChatId: string | null;
	onSelectChat: (chatId: string) => void;
	onDeleteChat: (chatId: string) => void;
	refreshTrigger: number;
	isOpen: boolean;
	onClose: () => void;
}

export function ChatHistory(props: ChatHistoryProps) {
	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose} className="max-w-md p-6 top-[-50vh]">
			<div data-testid="history-modal">
				<h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Chat History</h3>
				<div className="max-h-[60vh] overflow-y-auto">
					<ChatHistoryList
						currentChatId={props.currentChatId}
						onSelectChat={props.onSelectChat}
						onDeleteChat={props.onDeleteChat}
						refreshTrigger={props.refreshTrigger}
					/>
				</div>
			</div>
		</Modal>
	);
}
