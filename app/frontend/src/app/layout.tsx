import { Outfit } from 'next/font/google';
import './globals.css';
import 'flatpickr/dist/flatpickr.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import QueryProvider from '@/context/QueryProvider';

const outfit = Outfit({
	subsets: ['latin'],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${outfit.className} dark:bg-gray-900`}>
				<ThemeProvider>
					<SidebarProvider>
						<ToastProvider>
							<QueryProvider>{children}</QueryProvider>
						</ToastProvider>
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
