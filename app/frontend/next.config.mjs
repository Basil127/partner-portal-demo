/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'standalone',
	env: {
		// Empty string means "use relative URLs" — the rewrite below proxies /api/* to the backend.
		// Override with a full URL only if you need direct client→backend connections (not recommended).
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
	},
	/**
	 * Proxy all /api/* requests through the Next.js server to the backend.
	 * This eliminates browser CORS and Private Network Access issues because
	 * the browser always talks to the same origin (the frontend). The Next.js
	 * server-side process then forwards the request to BACKEND_INTERNAL_URL
	 * (the backend Docker service, or localhost in local dev) over the internal
	 * network — never exposed to the client.
	 */
	async rewrites() {
		const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';
		return [
			{
				source: '/api/:path*',
				destination: `${backendUrl}/api/:path*`,
			},
		];
	},
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		});
		return config;
	},
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},
};

export default nextConfig;
