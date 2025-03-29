import z from "zod"
import { objectIdValidationSchema } from "./mongoose.validation"
import { STATUS, PRIORITY } from "@/utils/constants"

const taskValidationSchema = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().min(3).max(1000).optional(),
  project: objectIdValidationSchema('Invalid project id'),
  status: z.enum(Object.values(STATUS.TASK)).optional(),
  priority: z.enum(Object.values(PRIORITY)).optional(),
  dueDate: z.string().date().optional(),
})

const paramsIdValidationSchema = z.object({
  id: objectIdValidationSchema("Invalid task id")
})

export { taskValidationSchema, paramsIdValidationSchema }
