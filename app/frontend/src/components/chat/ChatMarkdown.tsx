'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMarkdownProps {
	content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
				ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0">{children}</ul>,
				ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0">{children}</ol>,
				li: ({ children }) => <li className="mb-1">{children}</li>,
				code: ({ className, children, ...props }) => {
					const isInline = !className;
					if (isInline) {
						return (
							<code
								className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800"
								{...props}
							>
								{children}
							</code>
						);
					}
					return (
						<code
							className={`block overflow-x-auto rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800 ${className || ''}`}
							{...props}
						>
							{children}
						</code>
					);
				},
				pre: ({ children }) => <pre className="mb-2 overflow-x-auto last:mb-0">{children}</pre>,
				a: ({ href, children }) => (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
					>
						{children}
					</a>
				),
				h1: ({ children }) => <h1 className="mb-2 text-xl font-bold">{children}</h1>,
				h2: ({ children }) => <h2 className="mb-2 text-lg font-bold">{children}</h2>,
				h3: ({ children }) => <h3 className="mb-2 text-base font-bold">{children}</h3>,
				blockquote: ({ children }) => (
					<blockquote className="mb-2 border-l-4 border-gray-300 pl-4 italic dark:border-gray-600">
						{children}
					</blockquote>
				),
				table: ({ children }) => (
					<div className="mb-2 overflow-x-auto">
						<table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
							{children}
						</table>
					</div>
				),
				th: ({ children }) => (
					<th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold dark:border-gray-600 dark:bg-gray-800">
						{children}
					</th>
				),
				td: ({ children }) => (
					<td className="border border-gray-300 px-3 py-2 dark:border-gray-600">{children}</td>
				),
			}}
		>
			{content}
		</ReactMarkdown>
	);
}
