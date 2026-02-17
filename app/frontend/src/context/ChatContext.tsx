'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ChatContextType {
	isHistoryOpen: boolean;
	openHistory: () => void;
	closeHistory: () => void;
	toggleHistory: () => void;
	onNewChat: () => void;
	setNewChatHandler: (handler: () => void) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [newChatHandler, setNewChatHandlerState] = useState<() => void>(() => () => {});

	const openHistory = useCallback(() => setIsHistoryOpen(true), []);
	const closeHistory = useCallback(() => setIsHistoryOpen(false), []);
	const toggleHistory = useCallback(() => setIsHistoryOpen((prev) => !prev), []);

	const onNewChat = useCallback(() => {
		newChatHandler();
		closeHistory();
	}, [newChatHandler, closeHistory]);

	const setNewChatHandler = useCallback((handler: () => void) => {
		setNewChatHandlerState(() => handler);
	}, []);

	return (
		<ChatContext.Provider
			value={{
				isHistoryOpen,
				openHistory,
				closeHistory,
				toggleHistory,
				onNewChat,
				setNewChatHandler,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
}

export function useChatContext() {
	const context = useContext(ChatContext);
	if (context === undefined) {
		throw new Error('useChatContext must be used within a ChatProvider');
	}
	return context;
}
