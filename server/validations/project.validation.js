import z from "zod"
import { objectIdValidationSchema } from "./mongoose.validation"

const projectValidationSchema = z.object({
  name: z.string().trim().min(3).max(255),
  description: z.string().trim().min(3).max(1000).optional(),
  workspace: objectIdValidationSchema('Invalid workspace id'),
  tasks: z.array(objectIdValidationSchema('Invalid task id')).optional()
})

const paramsIdValidationSchema = z.object({
  id: objectIdValidationSchema("Invalid project id")
})

export { projectValidationSchema, paramsIdValidationSchema }
