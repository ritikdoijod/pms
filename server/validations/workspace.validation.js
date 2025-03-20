import z from "zod";
import { objectIdValidationSchema } from "./mongoose.validation";

const workspaceValidationSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(1000).optional(),
  author: objectIdValidationSchema("Invalid author id"),
  projects: z.array(objectIdValidationSchema("Invalid project id")).optional(),
});

export { workspaceValidationSchema };
