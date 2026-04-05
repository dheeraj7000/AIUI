import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export function createDb(connectionString: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const client = postgres(connectionString, {
    ssl: isProduction ? 'require' : false,
  });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;

export * from './schema';
export * from './queries';
