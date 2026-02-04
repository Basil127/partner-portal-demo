'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from '@/components/ui/toast/ToastContainer';
import { ToastMessage, ToastContextType } from '@/components/ui/toast/types';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
		const id = Math.random().toString(36).substring(2, 9);
		setToasts((prev) => [...prev, { ...toast, id }]);
	}, []);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const success = useCallback(
		(message: string, title?: string, duration = 5000) => {
			addToast({ type: 'success', message, title, duration });
		},
		[addToast],
	);

	const error = useCallback(
		(message: string, title?: string, duration = 5000) => {
			addToast({ type: 'error', message, title, duration });
		},
		[addToast],
	);

	const warning = useCallback(
		(message: string, title?: string, duration = 5000) => {
			addToast({ type: 'warning', message, title, duration });
		},
		[addToast],
	);

	const info = useCallback(
		(message: string, title?: string, duration = 5000) => {
			addToast({ type: 'info', message, title, duration });
		},
		[addToast],
	);

	return (
		<ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
			{children}
			<ToastContainer toasts={toasts} removeToast={removeToast} />
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
};
