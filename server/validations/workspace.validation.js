import z from "zod";
import { objectIdValidationSchema } from "./mongoose.validation";

const workspaceValidationSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(1000).optional(),
  projects: z.array(objectIdValidationSchema("Invalid project id")).optional(),
});

const paramsIdValidationSchema = z.object({
  id: objectIdValidationSchema("Invalid workspace id")
})

export { workspaceValidationSchema, paramsIdValidationSchema };
