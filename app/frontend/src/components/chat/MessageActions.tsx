'use client';

import type { UIMessage } from 'ai';
import { ClipboardCopy, Check } from 'lucide-react';
import { useState } from 'react';

interface MessageActionsProps {
	message: UIMessage;
}

export function MessageActions({ message }: MessageActionsProps) {
	const [copied, setCopied] = useState(false);

	const textContent =
		message.parts
			?.filter((p) => p.type === 'text')
			.map((p) => p.text)
			.join('\n') || '';

	const handleCopy = async () => {
		if (!textContent) return;
		await navigator.clipboard.writeText(textContent);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (!textContent) return null;

	return (
		<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
			<button
				onClick={handleCopy}
				className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
				title="Copy message"
				type="button"
			>
				{copied ? <Check className="size-3.5" /> : <ClipboardCopy className="size-3.5" />}
			</button>
		</div>
	);
}
