import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? 'test.env' : 'development.env';
// Locate the root directory (5 levels up from src/infrastructure/config)
const rootDir = path.resolve(__dirname, '../../../../../');
dotenv.config({ path: path.resolve(rootDir, envFile) });

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
};
