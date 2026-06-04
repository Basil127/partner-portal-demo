import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate app/backend/ (3 levels up: config -> infrastructure -> src -> app/backend)
const backendDir = path.resolve(__dirname, '../../../');
// Locate repo root (5 levels up)
const rootDir = path.resolve(__dirname, '../../../../../');

// Load environment variables:
//  - test:        repo-root test.env  (jest uses this)
//  - development: app/backend/.env.local
//  - production:  no file — Docker injects vars via env_file in docker-compose
if (process.env.NODE_ENV === 'test') {
	dotenv.config({ path: path.resolve(rootDir, 'test.env') });
} else if (process.env.NODE_ENV !== 'production') {
	dotenv.config({ path: path.resolve(backendDir, '.env.local') });
}

export const config = {
	nodeEnv: process.env.NODE_ENV || 'development',
	port: parseInt(process.env.PORT || '3001', 10),
	host: process.env.HOST || 'localhost',
	database: {
		type: process.env.DB_TYPE || 'sqlite',
		path: process.env.DB_PATH || './data/dev.db',
		host: process.env.DB_HOST,
		port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
		name: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'default-secret',
	},
	session: {
		secret: process.env.SESSION_SECRET || 'default-session-secret',
	},
	logLevel: process.env.LOG_LEVEL || 'info',
	corsOrigins: process.env.CORS_ORIGINS
		? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
		: true,
	externalClient: {
		baseUrl: process.env.EXTERNAL_CLIENT_BASE_URL || 'http://localhost:8000',
		channelCode: process.env.EXTERNAL_CLIENT_CHANNEL_CODE || '',
		appKey: process.env.EXTERNAL_CLIENT_APP_KEY || undefined,
		originatingApplication: process.env.EXTERNAL_CLIENT_ORIGINATING_APP || undefined,
		externalSystem: process.env.EXTERNAL_CLIENT_EXTERNAL_SYSTEM || undefined,
	},
	ai: {
		openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
		openrouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
	},
	mcp: {
		// Simple shared-secret guard for the /mcp endpoint. This is a POC default —
		// override with MCP_AUTH_TOKEN in any real deployment.
		authToken: process.env.MCP_AUTH_TOKEN || 'ohm-demo-mcp-poc-token',
	},
};
