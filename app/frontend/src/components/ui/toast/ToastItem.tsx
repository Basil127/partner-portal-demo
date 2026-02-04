import React, { useEffect, useState } from 'react';
import { ToastMessage } from './types';
import { CloseIcon } from '@/icons';

interface ToastItemProps {
	toast: ToastMessage;
	onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		if (toast.duration) {
			const timer = setTimeout(() => {
				setIsExiting(true);
			}, toast.duration);

			return () => clearTimeout(timer);
		}
	}, [toast.duration]);

	// Handle animation end to actually remove from context
	const handleAnimationEnd = () => {
		if (isExiting) {
			onRemove(toast.id);
		}
	};

	const handleClose = () => {
		setIsExiting(true);
	};

	const variantClasses = {
		success: {
			container: 'border-l-4 border-success-500 bg-white dark:bg-gray-800 dark:border-success-500',
			icon: 'text-success-500',
		},
		error: {
			container: 'border-l-4 border-error-500 bg-white dark:bg-gray-800 dark:border-error-500',
			icon: 'text-error-500',
		},
		warning: {
			container: 'border-l-4 border-warning-500 bg-white dark:bg-gray-800 dark:border-warning-500',
			icon: 'text-warning-500',
		},
		info: {
			container: 'border-l-4 border-blue-500 bg-white dark:bg-gray-800 dark:border-blue-500',
			icon: 'text-blue-500',
		},
	};

	const icons = {
		success: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
		),
		error: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
				/>
			</svg>
		),
		warning: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z"
				/>
			</svg>
		),
		info: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
				/>
			</svg>
		),
	};

	return (
		<div
			className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out ${
				variantClasses[toast.type].container
			} ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'} mb-3`}
			role="alert"
			onTransitionEnd={handleAnimationEnd}
		>
			<div className="p-4">
				<div className="flex items-start">
					<div className="flex-shrink-0">
						<span className={variantClasses[toast.type].icon}>{icons[toast.type]}</span>
					</div>
					<div className="ml-3 w-0 flex-1 pt-0.5">
						{toast.title && (
							<p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.title}</p>
						)}
						<p className={`text-sm text-gray-500 dark:text-gray-400 ${toast.title ? 'mt-1' : ''}`}>
							{toast.message}
						</p>
					</div>
					<div className="ml-4 flex flex-shrink-0">
						<button
							type="button"
							className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-400"
							onClick={handleClose}
						>
							<span className="sr-only">Close</span>
							<CloseIcon className="h-5 w-5" aria-hidden="true" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ToastItem;
