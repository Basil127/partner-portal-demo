import { createClient, createConfig } from '@/lib/api-client/client/index';

/**
 * Server-side API client for use in Next.js API routes.
 * The generated singleton client is configured client-side in the admin layout,
 * so server-side code needs its own configured instance.
 */
export const serverClient = createClient(
	createConfig({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
	}),
);
