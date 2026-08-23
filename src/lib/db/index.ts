/**
 * HSE Management System - Database Connection
 * Kết nối cơ sở dữ liệu SQLite sử dụng Drizzle ORM
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

const DB_PATH = path.join(process.cwd(), 'data', 'hse.db');

// Tạo thư mục data nếu chưa tồn tại
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);

// Bật WAL mode để tối ưu hiệu năng đọc/ghi đồng thời
sqlite.pragma('journal_mode = WAL');
// Bật Foreign Keys để đảm bảo tính toàn vẹn tham chiếu
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { sqlite };
export default db;
