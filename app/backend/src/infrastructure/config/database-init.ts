import { DatabaseAdapter } from '../adapters/database';
import { logger } from '../adapters/logger';

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

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}
