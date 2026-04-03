import { createDb, type Database } from '@aiui/design-core';
import { log } from './errors';

let _db: Database | null = null;

/**
 * Get or create the database connection.
 */
export function getDb(): Database {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  _db = createDb(url);
  log('info', 'Database connection initialized');
  return _db;
}
