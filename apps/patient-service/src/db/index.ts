import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { patients } from './schema';

export const db = drizzle(process.env.DATABASE_URL!, { schema: {patients} });
export const tables = {patients};
