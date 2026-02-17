'use client';
import { ThemeToggleButton } from '@/components/common/ThemeToggleButton';
import NotificationDropdown from '@/components/header/NotificationDropdown';
import UserDropdown from '@/components/header/UserDropdown';
import { useSidebar } from '@/context/SidebarContext';
import { useChatContext } from '@/context/ChatContext';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';

const AppChatHeader: React.FC = () => {
	const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

	const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
	const { toggleHistory, onNewChat } = useChatContext();

	const pageTitle = 'Chat';

	const handleToggle = () => {
		if (window.innerWidth >= 1024) {
			toggleSidebar();
		} else {
			toggleMobileSidebar();
		}
	};

	const toggleApplicationMenu = () => {
		setApplicationMenuOpen(!isApplicationMenuOpen);
	};

	return (
		<header className="sticky top-0 flex w-full bg-white border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
			<div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
				<div className="flex items-center justify-between w-full gap-2 px-1.5 py-1.5 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-2">
					<div className="flex items-center gap-4 flex-1">
						<button
							className="items-center justify-center w-7 h-7 text-gray-500 border-gray-200 rounded-lg dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-8 lg:w-8 lg:border"
							onClick={handleToggle}
							aria-label="Toggle Sidebar"
							title="Toggle Sidebar"
						>
							{isMobileOpen ? (
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
										fill="currentColor"
									/>
								</svg>
							) : (
								<svg
									width="16"
									height="12"
									viewBox="0 0 16 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
										fill="currentColor"
									/>
								</svg>
							)}
						</button>

						
						<div className="hidden lg:block">
							<h1 className="text-lg font-semibold">{pageTitle}</h1>
						</div>
					<div className="flex flex-row gap-2 ml-auto lg:ml-6">
						<Button
							variant="outline"
							size="sm"
							onClick={toggleHistory}
							className="flex items-center gap-2"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="opacity-70"
								>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2ZM0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8ZM8 4C8.41421 4 8.75 4.33579 8.75 4.75V7.68934L10.7803 9.71967C11.0732 10.0126 11.0732 10.4874 10.7803 10.7803C10.4874 11.0732 10.0126 11.0732 9.71967 10.7803L7.46967 8.53033C7.32902 8.38968 7.25 8.19891 7.25 8V4.75C7.25 4.33579 7.58579 4 8 4Z"
										fill="currentColor"
									/>
								</svg>
								<span className="hidden sm:inline">History</span>
							</Button>
							<Button
							variant="primary"
							size="sm"
							onClick={onNewChat}
							className="flex items-center gap-2 dark:bg-brand-300 dark:hover:bg-brand-400"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M8 2.75C8.41421 2.75 8.75 3.08579 8.75 3.5V7.25H12.5C12.9142 7.25 13.25 7.58579 13.25 8C13.25 8.41421 12.9142 8.75 12.5 8.75H8.75V12.5C8.75 12.9142 8.41421 13.25 8 13.25C7.58579 13.25 7.25 12.9142 7.25 12.5V8.75H3.5C3.08579 8.75 2.75 8.41421 2.75 8C2.75 7.58579 3.08579 7.25 3.5 7.25H7.25V3.5C7.25 3.08579 7.58579 2.75 8 2.75Z"
									fill="currentColor"
								/>
							</svg>
							<span className="hidden sm:inline">New Chat</span>
					</Button>
				</div>
			</div>
					<button
						onClick={toggleApplicationMenu}
						className="flex items-center justify-center w-7 h-7 text-gray-700 rounded-lg z-50 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
								fill="currentColor"
							/>
						</svg>
					</button>
				</div>
				<div
					className={`${
						isApplicationMenuOpen ? 'flex' : 'hidden'
					} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none ml-auto`}
				>
					<div className="flex items-center gap-2 2xsm:gap-3">
						<ThemeToggleButton />
						<NotificationDropdown />
					</div>
					<UserDropdown />
				</div>
			</div>
		</header>
	);
};

export default AppChatHeader;
