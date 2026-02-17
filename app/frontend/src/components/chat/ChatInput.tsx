'use client';

import { Send, Square } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useRef } from 'react';

interface ChatInputProps {
	input: string;
	setInput: (value: string) => void;
	onSubmit: () => void;
	status: string;
	stop: () => void;
}

export function ChatInput({ input, setInput, onSubmit, status, stop }: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const isStreaming = status === 'streaming' || status === 'submitted';

	const adjustHeight = useCallback(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
		}
	}, []);

	useEffect(() => {
		adjustHeight();
	}, [input, adjustHeight]);

	// Auto-focus
	useEffect(() => {
		const timer = setTimeout(() => {
			textareaRef.current?.focus();
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (!isStreaming && input.trim()) {
				onSubmit();
			}
		}
	};

	const handleSubmit = () => {
		if (isStreaming) {
			stop();
		} else if (input.trim()) {
			onSubmit();
		}
	};

	return (
		<div className="mx-auto w-full max-w-4xl px-4 pb-4" data-testid="chat-input">
			<div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
				<textarea
					ref={textareaRef}
					value={input}
					onChange={handleInput}
					onKeyDown={handleKeyDown}
					placeholder="Send a message..."
					className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
					rows={1}
					data-testid="chat-textarea"
				/>
				<button
					onClick={handleSubmit}
					disabled={!isStreaming && !input.trim()}
					className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
						isStreaming
							? 'bg-red-500 text-white hover:bg-red-600'
							: input.trim()
								? 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600'
								: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
					}`}
					type="button"
					data-testid="chat-submit"
				>
					{isStreaming ? <Square className="size-4" /> : <Send className="size-4" />}
				</button>
			</div>
			<p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
				AI can make mistakes. Verify important information.
			</p>
		</div>
	);
}
