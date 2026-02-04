import React from 'react';
import { ToastMessage } from './types';
import ToastItem from './ToastItem';

interface ToastContainerProps {
	toasts: ToastMessage[];
	removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
	return (
		<div
			aria-live="assertive"
			className="pointer-events-none fixed inset-0 z-9999 flex flex-col justify-end items-end px-4 py-6 sm:p-6"
		>
			<div className="flex w-full flex-col items-center space-y-4 sm:items-end">
				{toasts.map((toast) => (
					<ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
				))}
			</div>
		</div>
	);
};
