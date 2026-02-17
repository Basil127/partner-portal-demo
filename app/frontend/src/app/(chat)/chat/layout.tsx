'use client';

import { useSidebar } from '@/context/SidebarContext';
import { BookingProvider } from '@/context/BookingContext';
import { ChatProvider } from '@/context/ChatContext';
// import AppHeader from '@/layout/AppHeader';
import AppSidebar from '@/layout/AppSidebar';
import Backdrop from '@/layout/Backdrop';
import React from 'react';
import { client } from '@/lib/api-client/client.gen';
import AppChatHeader from '@/layout/AppChatHeader';

client.setConfig({
	baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { isExpanded, isHovered, isMobileOpen } = useSidebar();

	// Dynamic class for main content margin based on sidebar state
	const mainContentMargin = isMobileOpen
		? 'ml-0'
		: isExpanded || isHovered
			? 'lg:ml-[250px]'
			: 'lg:ml-[70px]';

	return (
		<BookingProvider>
			<ChatProvider>
				<div className="min-h-screen xl:flex">
					{/* Sidebar and Backdrop */}
					<AppSidebar />
					<Backdrop />
					{/* Main Content Area */}
					<div className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}>
						{/* Header */}
						<AppChatHeader />
						{/* Page Content */}
						<div className="px-4 mx-auto max-w-(--breakpoint-2xl) md:px-6">{children}</div>
					</div>
				</div>
			</ChatProvider>
		</BookingProvider>
	);
}
