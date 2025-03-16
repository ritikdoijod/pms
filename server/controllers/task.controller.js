import { Task } from "@/models/task.model.js";
import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { NotFoundException, BadRequestException } from "@/utils/app-error.js";
import { Project } from "@/models/project.model.js";
import { Workspace } from "@/models/workspace.model.js";
import { STATUS } from "@/utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ author: req.user._id }).lean();

  return res.success({ data: { tasks } })
})

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();

  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  return res.success({ data: { task } })
})

const createTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, workspace: workspaceId, status, priority } = req.body;

  console.log("test");

  const [project, workspace] = await Promise.all([
    Workspace.findById(workspaceId).lean(),
    Project.findById(projectId).lean()
  ])

  if (!workspace) throw new NotFoundException("Workspace not found")
  req.authz(workspace)

  if (!project) throw new NotFoundException("Project not found");
  req.authz(project)

  console.log(project);

  if (project.workspace.toString() !== workspace._id)
    throw new BadRequestException('Project does not belongs to the workspace.');

  const task = new Task({
    title,
    description,
    project: project._id,
    workspace: workspace._id,
    status,
    priority
  })

  await task.save();

  return res.success({ status: STATUS.HTTP.CREATED, data: { task } })
})

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, workspace: workspaceId, status, priority } = req.body;
  const updateData = {
    title,
    description,
    status,
    priority
  }

  const task = await Task.findById(req.params.id).lean();
  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  if (projectId) {
    const project = await Project.findById(projectId).lean();
    if (!project) throw new NotFoundException("Project not found");
    req.authz(project);
    updateData.project = project._id;
  }

  if (workspaceId) {
    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) throw new NotFoundException("Workspace not found");
    req.authz(workspace);
    updateData.workspace = workspace._id;
  }

  const updatedTask = Task.findByIdAndUpdate(task._id, updateData, { returnDocument: 'after' }).lean();

  return res.success({ data: { task: updatedTask } })
})

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  await Task.findByIdAndDelete(task._id);

  return res.success({})
})

export { getTasks, getTask, createTask, updateTask, deleteTask }
