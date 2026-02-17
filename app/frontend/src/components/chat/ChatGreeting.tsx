'use client';

export function ChatGreeting() {
	return (
		<div className="mx-auto mt-8 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8" data-testid="chat-greeting">
			<div className="font-semibold text-xl text-gray-800 dark:text-white/90 md:text-2xl">Hello there!</div>
			<div className="mt-2 text-xl text-gray-500 dark:text-gray-400 md:text-2xl">
				How can I help you today?
			</div>
		</div>
	);
}
