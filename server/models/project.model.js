import mongoose from "mongoose";


const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    }]
  },
  {
    timestamps: true
  }
)

const Project = mongoose.model('Project', projectSchema)

export { Project };
