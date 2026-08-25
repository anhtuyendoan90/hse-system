import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from './src/lib/db/schema';

const client = createClient({ url: 'file:test.db' });
const db = drizzle(client);

const q = db.select().from(users);
console.log('all:', typeof q.all, 'get:', typeof q.get, 'run:', typeof q.run);
