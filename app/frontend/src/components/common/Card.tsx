import React from 'react';

interface ComponentCardProps {
	children: React.ReactNode;
	className?: string; // Additional custom classes for styling
}

const Card: React.FC<ComponentCardProps> = ({ children, className = '' }) => {
	return (
		<div
			className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
		>
			<div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
				<div className="space-y-6">{children}</div>
			</div>
		</div>
	);
};

export default Card;
