import { asyncHandler } from "@/middlewares/async-handler.middleware.js"
import { Project } from "@/models/project.model.js"
import { Workspace } from "@/models/workspace.model.js"
import { NotFoundException } from "@/utils/app-error.js"


const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ author: req.user?._id }).lean();

  return res.success({ data: { projects } })
})

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();

  if (!project) throw NotFoundException("Project not found")

  req.authz(project);

  return res.success({ data: { project } })
})

const createProject = asyncHandler(async (req, res) => {
  const { name, description, workspace: workspaceId } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) throw NotFoundException('Workspace not found');

    req.authz(workspace);

    const project = new Project({ name, description, workspace: workspace._id, author: req.user?._id })

    await project.save()

    workspace.projects.push(project._id);

    await workspace.save();

    await session.commitTransaction();

    return res.success({ data: { project } })
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
})

const updateProject = asyncHandler(async (req, res) => {
  const { name, description, workspace: workspaceId } = req.body;
  const updateData = { name, description };

  const project = await Project.findById(req.params.id).lean();
  if (!project) throw NotFoundException("Project not found")
  req.authz(project);

  if (workspaceId) {
    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) throw NotFoundException('Workspace not found');
    updateData.workspace = req.authz(workspace);
  }

  const updatedProject = await Project.findByIdAndUpdate(project._id, updateData, { returnDocument: 'after' }).lean();

  return res.success({ data: { project: updatedProject } })
})

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();

  if (!project) throw NotFoundException("Project not found")
  req.authz(project);

  await Project.findByIdAndDelete(project._id).lean();

  return res.success({})
})

export { getProjects, getProject, createProject, updateProject, deleteProject }
