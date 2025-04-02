import z from "zod"

const createProjectFormSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(1000).optional(),
});

export { createProjectFormSchema };
