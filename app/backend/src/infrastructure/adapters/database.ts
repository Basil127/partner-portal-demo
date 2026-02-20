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

	/**
	 * Ensures the target database exists, creating it if necessary.
	 * Connects to the always-available "postgres" maintenance database,
	 * creates the target DB if missing, then returns so the normal Pool
	 * can be constructed against the correct database.
	 */
	static async ensureDatabase(): Promise<void> {
		const dbName = config.database.name;
		if (!dbName) return;

		const adminPool = new Pool({
			host: config.database.host,
			port: config.database.port,
			database: 'postgres', // always exists
			user: config.database.user,
			password: config.database.password,
		});

		try {
			const res = await adminPool.query(
				`SELECT 1 FROM pg_database WHERE datname = $1`,
				[dbName],
			);
			if (res.rowCount === 0) {
				// CREATE DATABASE cannot run inside a transaction block
				await adminPool.query(`CREATE DATABASE "${dbName}"`);
				await adminPool.query(
					`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${config.database.user}"`,
				);
				logger.info(`Created database: ${dbName}`);
			}
		} finally {
			await adminPool.end();
		}
	}

	/**
	 * Converts SQLite-style `?` positional placeholders to PostgreSQL-style
	 * `$1`, `$2`, ... placeholders so that shared SQL strings work with both
	 * drivers without modification at the call site.
	 */
	private convertPlaceholders(sql: string): string {
		let index = 0;
		return sql.replace(/\?/g, () => `$${++index}`);
	}

	async query(sql: string, params: unknown[] = []): Promise<unknown[]> {
		const result = await this.pool.query(this.convertPlaceholders(sql), params);
		return result.rows;
	}

	async execute(sql: string, params: unknown[] = []): Promise<void> {
		await this.pool.query(this.convertPlaceholders(sql), params);
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

/**
 * For Postgres, ensures the target database exists before the adapter
 * pool tries to connect to it.  No-op for SQLite.
 */
export async function ensureDatabaseExists(): Promise<void> {
	if (config.database.type === 'postgres') {
		await PostgresAdapter.ensureDatabase();
	}
}
