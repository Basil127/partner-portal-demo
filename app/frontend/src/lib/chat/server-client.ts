import { createClient, createConfig } from '@/lib/api-client/client/index';

/**
 * Server-side API client for use in Next.js API routes.
 * Uses BACKEND_INTERNAL_URL to reach the backend directly over the internal
 * Docker network, bypassing the Next.js rewrite proxy and any CORS restrictions.
 * Falls back to localhost:3001 for local development outside Docker.
 */
export const serverClient = createClient(
	createConfig({
		baseUrl: process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001',
	}),
);
