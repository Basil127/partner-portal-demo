import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: '../../openapi/openapi.yaml',
	output: 'src/lib/api-client',
	plugins: ['@hey-api/client-fetch', '@hey-api/typescript', '@hey-api/schemas', 'zod'],
});
