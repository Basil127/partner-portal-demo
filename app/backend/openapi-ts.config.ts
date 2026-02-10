import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: '../../openapi/external/mock-opera.json',
	output: 'src/infrastructure/adapters/http/external-client',
	plugins: [
		'@hey-api/client-fetch',
		'@hey-api/typescript',
		'@hey-api/sdk',
		'@hey-api/schemas',
		'zod',
	],
});
