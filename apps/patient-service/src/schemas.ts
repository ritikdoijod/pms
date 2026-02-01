import z from 'zod';

export const PatientIdSchema = z.object({
  patientId: z.uuidv7(),
});

export const PatientRequestSchema = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.email(),
    date_of_birth: z.iso.date(),
  })
  .transform((value) => ({
    firstName: value.first_name,
    lastName: value.last_name,
    email: value.email,
    dateOfBirth: value.date_of_birth,
  }));

export const PatientResponseSchema = z
  .object({
    id: z.uuidv7(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    dateOfBirth: z.iso.date(),
  })
  .transform((value) => ({
    id: value.id,
    first_name: value.firstName,
    last_name: value.lastName,
    email: value.email,
    date_of_birth: value.dateOfBirth,
  }));
