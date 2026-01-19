import Database from 'better-sqlite3';
import { Pool } from 'pg';
import { config } from '../config/config.js';
import { logger } from '../adapters/logger.js';

export interface DatabaseAdapter {
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  close(): Promise<void>;
}

class SqliteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    logger.info(`SQLite database connected: ${dbPath}`);
  }

  async query(sql: string, params: unknown[] = []): Promise<unknown[]> {
    return this.db.prepare(sql).all(...params);
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    this.db.prepare(sql).run(...params);
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
    });
    logger.info('PostgreSQL database connected');
  }

  async query(sql: string, params: unknown[] = []): Promise<unknown[]> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    await this.pool.query(sql, params);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export function createDatabaseAdapter(): DatabaseAdapter {
  if (config.database.type === 'postgres') {
    return new PostgresAdapter();
  } else {
    return new SqliteAdapter(config.database.path);
  }
}
