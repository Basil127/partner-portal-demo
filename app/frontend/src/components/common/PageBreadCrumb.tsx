import Link from 'next/link';
import React from 'react';

interface BreadcrumbProps {
	pageTitle: string;
	items?: { label: string; href: string }[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, items }) => {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<nav className="hidden sm:block">
				<ol className="flex items-center gap-1.5">
					{items &&
						items.map((item, index) => (
							<li key={index} className="flex items-center gap-1.5">
								<Link
									className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500"
									href={item.href}
								>
									{item.label}
								</Link>
								<svg
									className="stroke-current text-gray-400"
									width="17"
									height="16"
									viewBox="0 0 17 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
										stroke=""
										strokeWidth="1.2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</li>
						))}
					<li>
						<h2
							className="text-xl font-semibold text-gray-800 dark:text-white/90"
							x-text="pageName"
						>
							{pageTitle}
						</h2>
					</li>
				</ol>
			</nav>
		</div>
	);
};

export default PageBreadcrumb;
