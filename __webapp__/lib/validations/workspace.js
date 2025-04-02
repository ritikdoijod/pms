import z from "zod";

const createWorkspaceFormSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(1000).optional(),
});

export { createWorkspaceFormSchema };
