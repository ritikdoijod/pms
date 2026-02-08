import { hash } from 'argon2';
import { db, tables } from './db';
import { logger } from '@pms/logger';
import { getUserByUsername } from './queries';

export async function bootstrap() {
  const password = process.env.ADMIN_USER_PASSWORD;
  if (!password) {
    logger.warn('ADMIN_USER_PASSWORD is missing in .env');
    return;
  }

  const existing = await getUserByUsername('admin');

  if (existing) {
    logger.info('Admin user already exists');
    return;
  }

  const hashedPassword = await hash(password);

  await db.insert(tables.users).values({
    username: 'admin',
    firstName: 'Admin',
    password: hashedPassword!,
  });
}
