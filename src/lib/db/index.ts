/**
 * HSE Management System - Database Connection
 * Kết nối cơ sở dữ liệu SQLite sử dụng Drizzle ORM
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

let client;

// Check if running in a serverless environment with a remote URL (Turso URLs can start with libsql://, wss://, https://, or http://)
if (process.env.DATABASE_URL) {
  client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
} else {
  // Local development fallback
  const DB_PATH = path.join(process.cwd(), 'data', 'hse.db');
  const dataDir = path.dirname(DB_PATH);
  
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Could not create data directory, possibly running in read-only serverless environment without DATABASE_URL set.');
  }
  
  client = createClient({ url: `file:${DB_PATH}` });
}

export const db = drizzle(client, { schema });
export const sqlite = client;
export default db;
