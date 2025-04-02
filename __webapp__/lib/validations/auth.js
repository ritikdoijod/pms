import z from "zod";

export const signUpFormSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: z.string().trim().email("Invalid email address").min(1).max(255),
    password: z.string().trim().min(6).max(255),
    confirmPassword: z.string().trim().max(255),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Password must match!",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z.string().trim().email("Invalid email address").min(1).max(255),
  password: z.string().trim().min(6).max(255),
});
