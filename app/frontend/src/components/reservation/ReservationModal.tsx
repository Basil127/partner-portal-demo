'use client';

import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ReservationModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
	isOpen,
	onClose,
	children,
	header,
	footer,
	size = 'lg',
}) => {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
	};

	const modal = (
		<div className="fixed inset-0 z-50 flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
			{/* Background overlay */}
			<div
				className="fixed inset-0 bg-gray-500/50 transition-opacity"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* This element is to trick the browser into centering the modal contents. */}
			<span className="hidden h-50% sm:inline-block sm:align-middle sm:h-50%" aria-hidden="true">
				&#8203;
			</span>

			{/* Modal panel */}
			<div
				ref={modalRef}
				className={`no-scrollbar inline-block align-center bg-white rounded-xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full dark:bg-gray-900 relative flex flex-col max-h-[90vh]`}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-10"
				>
					<span className="sr-only">Close</span>
					<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{/* Fixed header */}
				{header && (
					<div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
						{header}
					</div>
				)}

				{/* Scrollable content */}
				<div className="flex-1 overflow-y-scroll max-h-[65vh] px-6 py-5">{children}</div>

				{/* Fixed footer */}
				{footer && (
					<div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
						{footer}
					</div>
				)}
			</div>
		</div>
	);

	return createPortal(modal, document.body);
};
