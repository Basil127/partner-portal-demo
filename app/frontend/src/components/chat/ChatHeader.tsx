'use client';

import { Plus, Clock } from 'lucide-react';

interface ChatHeaderProps {
	onNewChat: () => void;
	onOpenHistory?: () => void;
}

export function ChatHeader({ onNewChat, onOpenHistory }: ChatHeaderProps) {
	return (
		<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700" data-testid="chat-header">
			<div className="flex items-center gap-2">
				<h2 className="font-semibold text-gray-800 dark:text-white">AI Chat</h2>
			</div>
			<div className="flex items-center gap-2">
				{onOpenHistory && (
					<button
						onClick={onOpenHistory}
						className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
						type="button"
						data-testid="history-button"
					>
						<Clock className="size-4" />
						<span>History</span>
					</button>
				)}
				<button
					onClick={onNewChat}
					className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
					type="button"
					data-testid="new-chat-button"
				>
					<Plus className="size-4" />
					<span>New Chat</span>
				</button>
			</div>
		</div>
	);
}
