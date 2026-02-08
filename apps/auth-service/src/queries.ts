import { eq } from 'drizzle-orm';
import { db, tables } from './db';

export async function getUsers() {
  const result = await db.select().from(tables.users);

  return result;
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.email, email));

  return result[0];
}

export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.username, username));

  return result[0];
}

