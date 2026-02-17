'use client';

import { useEffect, useState } from 'react';
import { useScrollToBottom } from './use-scroll-to-bottom';

export function useChatMessages({ status }: { status: string }) {
	const { containerRef, endRef, isAtBottom, scrollToBottom } = useScrollToBottom();

	const [hasSentMessage, setHasSentMessage] = useState(false);

	useEffect(() => {
		if (status === 'submitted') {
			setHasSentMessage(true);
		}
	}, [status]);

	return {
		containerRef,
		endRef,
		isAtBottom,
		scrollToBottom,
		hasSentMessage,
	};
}
