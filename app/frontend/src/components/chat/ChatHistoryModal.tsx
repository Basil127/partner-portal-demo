import { ChatHistoryList } from './ChatHistoryList';
import { Modal } from '@/components/ui/modal';
import useWindowDimensions from '@/hooks/useWindowDimensions';

interface ChatHistoryProps {
	currentChatId: string | null;
	onSelectChat: (chatId: string) => void;
	onDeleteChat: (chatId: string) => void;
	refreshTrigger: number;
	isOpen: boolean;
	onClose: () => void;
}

export function ChatHistoryModal(props: ChatHistoryProps) {
	return (
		<Modal 
			isOpen={props.isOpen} 
			onClose={props.onClose} 
			className="max-w-xl p-6" 
			align="top"
			>
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
