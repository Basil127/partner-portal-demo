import type { DatabaseAdapter } from '../adapters/database.js';
import { logger } from '../adapters/logger.js';

export async function initializeDatabase(db: DatabaseAdapter): Promise<void> {
	try {
		// Create bookings table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

		// Create chats table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

		// Create messages table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
      )
    `);

		logger.info('Database initialized successfully');
	} catch (error) {
		logger.error(error as Error, 'Failed to initialize database');
		throw error;
	}
}
