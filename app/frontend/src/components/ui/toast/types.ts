export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
	id: string;
	type: ToastType;
	title?: string;
	message: string;
	duration?: number; // Duration in ms
}

export interface ToastContextType {
	addToast: (toast: Omit<ToastMessage, 'id'>) => void;
	removeToast: (id: string) => void;
	success: (message: string, title?: string, duration?: number) => void;
	error: (message: string, title?: string, duration?: number) => void;
	warning: (message: string, title?: string, duration?: number) => void;
	info: (message: string, title?: string, duration?: number) => void;
}
