import z from 'zod';

export const UserResponseSchema = z
  .object({
    id: z.uuidv7(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    email: z.email().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .transform((value) => ({
    id: value.id,
    first_name: value.firstName,
    last_name: value.lastName,
    email: value.email,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
  }));
