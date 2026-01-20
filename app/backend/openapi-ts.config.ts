import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../openapi/external/external-service.yaml',
  output: 'src/infrastructure/adapters/http/external-client',
  plugins: [
    '@hey-api/client-fetch', // Best for Node 22+ native fetch
    {
      name: '@hey-api/typescript',
      enums: 'javascript', // Exports enums as actual JS objects
    }
  ],
});