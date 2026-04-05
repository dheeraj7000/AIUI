import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Create a database connection with proper pooling and SSL configuration.
 * Works with Neon (serverless PostgreSQL), local PostgreSQL, and any standard PG host.
 */
export function createDb(connectionString: string) {
  const isProduction = process.env.NODE_ENV === 'production';

  const client = postgres(connectionString, {
    ssl: isProduction || connectionString.includes('neon.tech') ? 'require' : false,
    max: parseInt(process.env.DB_POOL_MAX ?? '20', 10),
    idle_timeout: 30,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;

export * from './schema';
export * from './queries';
