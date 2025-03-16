import mongoose from "mongoose"
import z from "zod"

const projectSchema = z.object({
  name: z.string().trim().min(3).max(255),
  description: z.string().trim().min(3).max(1000).optional(),
  author: z.string().refine(value => mongoose.isValidObjectId(value), {
    message: 'Invalid author id'
  }),
  workspace: z.string().refine(value => mongoose.isValidObjectId(value), {
    message: 'Invalid workspace id'
  }),
  tasks: z.array(z.string().refine(value => mongoose.isValidObjectId(value), {
    message: 'Invalid task id'
  })).optional()
})

export { projectSchema }
