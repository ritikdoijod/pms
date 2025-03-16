import z from "zod";

const userSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email("Invalid email address").min(1).max(255),
  password: z.string().trim().min(6).max(255),
});

const updateUserSchema = userSchema.partial();

export { updateUserSchema, userSchema };
