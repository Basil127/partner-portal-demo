'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMarkdownProps {
	content: string;
}

function preprocessMarkdown(text: string): string {
	const lines = text.split('\n');
	const fixed: string[] = [];

	for (const line of lines) {
		if (/^\s*\|/.test(line)) {
			// This line is a table row. Check if it ends properly with '|'.
			// If not, it likely has trailing prose — split it off.
			const trimmed = line.trimEnd();
			if (trimmed.endsWith('|')) {
				fixed.push(line);
			} else {
				const lastPipe = trimmed.lastIndexOf('|');
				if (lastPipe > 0) {
					const tableRow = trimmed.substring(0, lastPipe + 1);
					const trailing = trimmed.substring(lastPipe + 1).trim();
					fixed.push(tableRow);
					if (trailing) {
						fixed.push(''); // blank line to end table block
						fixed.push(trailing);
					}
				} else {
					fixed.push(line);
				}
			}
		} else {
			// Non-table line — check if a table row is embedded after some heading text
			const pipeIdx = line.indexOf('|');
			if (pipeIdx > 0) {
				const before = line.substring(0, pipeIdx).trim();
				const fromPipe = line.substring(pipeIdx).trim();
				const pipeCount = (fromPipe.match(/\|/g) || []).length;
				if (pipeCount >= 2 && before.length > 0) {
					if (before) fixed.push(before);
					fixed.push('');
					fixed.push(fromPipe);
					continue;
				}
			}
			fixed.push(line);
		}
	}

	// Second pass: collapse blank lines between consecutive table rows and
	// ensure a blank line before the first table row.
	const result: string[] = [];
	for (let i = 0; i < fixed.length; i++) {
		const cur = fixed[i];
		const prev = result[result.length - 1];
		const next = fixed[i + 1];

		const curIsTable = /^\s*\|/.test(cur);
		const prevIsTable = prev !== undefined && /^\s*\|/.test(prev);

		// Remove blank lines between table rows
		if (cur === '' && prevIsTable && next !== undefined && /^\s*\|/.test(next)) {
			continue;
		}
		// Ensure blank line before first table row
		if (curIsTable && prev !== undefined && prev !== '' && !prevIsTable) {
			result.push('');
		}
		result.push(cur);
	}

	return result.join('\n');
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
			{preprocessMarkdown(content)}
		</ReactMarkdown>
	);
}
