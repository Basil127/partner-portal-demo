// Server Component — force all pages under (primary) to render dynamically
// This prevents Next.js from attempting static prerendering during Docker build
// when the backend API is not available.
export const dynamic = 'force-dynamic';

export default function PrimaryLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
