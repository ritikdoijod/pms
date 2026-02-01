import { and, eq, ne } from 'drizzle-orm';
import z from 'zod';
import { db, tables } from './db';
import { PatientRequestSchema } from './schemas';

export async function getAllPatients() {
  return await db.select().from(tables.patients);
}

export async function getPatientById(patientId: string) {
  const result = await db
    .select()
    .from(tables.patients)
    .where(eq(tables.patients.id, patientId));

  return result[0];
}

export async function getPatientByEmail(email: string) {
  const result = await db
    .select()
    .from(tables.patients)
    .where(eq(tables.patients.email, email));

  return result[0];
}

export async function createPatient(
  data: z.infer<typeof PatientRequestSchema>
) {
  const result = await db.insert(tables.patients).values(data).returning();

  return result[0];
}

export async function updatePatient(
  patientId: string,
  data: z.infer<typeof PatientRequestSchema>
) {
  const result = await db
    .update(tables.patients)
    .set(data)
    .where(eq(tables.patients.id, patientId))
    .returning();

  return result[0];
}

export async function deletePatient(patientId: string) {
  await db.delete(tables.patients).where(eq(tables.patients.id, patientId));
}

export async function isEmailTakenByAnotherPatient(
  email: string,
  patientId: string
) {
  const result = await db
    .select()
    .from(tables.patients)
    .where(
      and(eq(tables.patients.email, email), ne(tables.patients.id, patientId))
    );

  return result[0];
}
