import { useRef, useState } from 'react';
import { MessageSquare, Trash2, Clock, Pencil, Check, X } from 'lucide-react';
import type { GetApiChatsResponse } from '@/lib/api-client';

type ChatItem = NonNullable<NonNullable<GetApiChatsResponse>['chats']>[number];

interface ChatHistoryProps {
    chat: ChatItem;
    onSelectChat: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    setChats: React.Dispatch<React.SetStateAction<ChatItem[]>>;
    isSelectedChat: boolean;
}

export function ChatHistory({ chat, onSelectChat, onDeleteChat, setChats, isSelectedChat }: ChatHistoryProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(chat.title ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditValue(chat.title ?? '');
        setIsEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const handleSave = async (e?: React.MouseEvent | React.FormEvent) => {
        e?.stopPropagation();
        const trimmed = editValue.trim();
        if (!trimmed || trimmed === chat.title) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch('/api/chat/history', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: chat.id, title: trimmed }),
            });
            if (res.ok) {
                setChats((prev) =>
                    prev.map((c) => (c.id === chat.id ? { ...c, title: trimmed } : c)),
                );
            }
        } catch (error) {
            console.error('Failed to rename chat:', error);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') setIsEditing(false);
    };

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
    
    if (isEditing) {
        return (
            <div
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 ${
                    isSelectedChat
                        ? 'bg-brand-50 dark:bg-brand-900/30'
                        : 'bg-gray-50 dark:bg-gray-800'
                }`}
            >
                <MessageSquare className="size-4 shrink-0 text-gray-400" />
                <form
                    className="flex min-w-0 flex-1 items-center gap-1"
                    onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                >
                    <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isSaving}
                        className="min-w-0 flex-1 rounded border border-brand-400 bg-white px-2 py-0.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-brand-400 dark:bg-gray-900 dark:text-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isSaving}
                        onClick={(e) => { e.stopPropagation(); handleSave(e); }}
                        className="shrink-0 rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                        title="Save"
                    >
                        <Check className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                        title="Cancel"
                    >
                        <X className="size-3.5" />
                    </button>
                </form>
            </div>
        );
    }

    return (
        <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id ?? '')}
            className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                isSelectedChat
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
                    {formatDate(chat.updatedAt ?? '')}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div
                    onClick={handleStartEdit}
                    className="rounded p-1 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    title="Rename chat"
                    data-testid={`rename-chat-${chat.id}`}
                >
                    <Pencil className="size-3.5" />
                </div>
                <div
                    onClick={(e) => handleDelete(e, chat.id ?? '')}
                    className="rounded p-1 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                    title="Delete chat"
                    data-testid={`delete-chat-${chat.id}`}
                >
                    <Trash2 className="size-3.5" />
                </div>
            </div>
        </button>
    );
}
