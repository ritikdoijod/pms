import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from './schema';

export const db = drizzle(process.env.DATABASE_URL!, { schema: { users } });
export const tables = { users };
