import 'server-only';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

/**
 * Runtime client on the POOLED url. neon-serverless (WebSocket Pool) because
 * neon-http has no interactive transactions, and every XP grant needs one.
 * Node 22+ and Bun have a global WebSocket, so no `ws` shim is needed.
 * No throw on a missing url: the Pool connects on the first query, so
 * `next build` (no secrets) still works and a request fails with the driver error.
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Neon drops idle clients; an unhandled pool 'error' would crash the server.
pool.on('error', (err: Error) => console.error('db pool error', err));

export const db = drizzle({ client: pool, schema, casing: 'snake_case' });
export type Db = typeof db;
