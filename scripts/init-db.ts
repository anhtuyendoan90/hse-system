/**
 * Script khởi tạo cơ sở dữ liệu HSE
 * Chạy: npx tsx scripts/init-db.ts
 */

import { initializeDatabase } from '../src/lib/db/migrate';

async function main() {
  try {
    await initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error);
    process.exit(1);
  }
}

main();
