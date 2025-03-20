import { Task } from '../models/task.model.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import { NotFoundException } from '../utils/app-error.js';
import { Project } from '../models/project.model.js';
import { STATUS } from '../utils/constants.js';

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ author: req.user._id }).lean();

  return res.success({ data: { tasks } })
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();

  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  return res.success({ data: { task } })
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, status, priority } = req.body;

  const project = await Project.findById(projectId).lean();

  if (!project) throw new NotFoundException("Project not found");
  req.authz(project);

  const task = new Task({
    title,
    description,
    project: project._id,
    status,
    priority
  });

  await task.save();

  return res.success({ status: STATUS.HTTP.CREATED, data: { task } })
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, status, priority } = req.body;
  const updateData = {
    title,
    description,
    status,
    priority
  };

  const task = await Task.findById(req.params.id).lean();
  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  if (projectId) {
    const project = await Project.findById(projectId).lean();
    if (!project) throw new NotFoundException("Project not found");
    req.authz(project);
    updateData.project = project._id;
  }

  const updatedTask = Task.findByIdAndUpdate(task._id, updateData, { returnDocument: 'after' }).lean();

  return res.success({ data: { task: updatedTask } })
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  await Task.findByIdAndDelete(task._id);

  return res.success({})
});

export { createTask, deleteTask, getTask, getTasks, updateTask };
