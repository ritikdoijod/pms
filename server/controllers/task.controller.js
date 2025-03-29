import { Task } from "@/models/task.model.js";
import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { NotFoundException } from "@/utils/app-error.js";
import { Project } from "@/models/project.model.js";
import { STATUS } from "@/utils/constants.js";
import mongoose from "mongoose";

const getTasks = asyncHandler(async (req, res) => {
  const { include, filters, sort, fields: projection, size, page } = req.query;
  const query = {
    $and: [
      { ...filters },
      {
        author: {
          $eq: req.user,
        },
      },
    ],
  };

  const options = {
    populate: include,
    sort,
    limit: size,
    skip: (page - 1) * size,
    lean: true,
  };

  const tasks = await Task.find(query, projection, options);

  const totalRecords = await Task.countDocuments(query);

  return res.success({
    data: { tasks },
    meta: {
      totalRecords,
      totalPages: page && Math.ceil(totalRecords / size),
      page,
      size,
    },
  });
})

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();

  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  return res.success({ data: { task } })
})

const createTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, status, priority } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const project = await Project.findById(projectId);

    if (!project) throw new NotFoundException("Project not found");
    req.authz(project)

    const task = new Task({
      title,
      description,
      project: project._id,
      author: req.user,
      status,
      priority
    })

    await task.save({ session });

    project.tasks.push(task._id);

    await project.save({ session });

    await session.commitTransaction();

    return res.success({ statusCode: STATUS.HTTP.CREATED, data: { task } })
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
})

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, status, priority } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction()

    const updateData = {
      title,
      description,
      status,
      priority
    }

    const task = await Task.findById(req.params.id).lean();
    if (!task) throw new NotFoundException("Task not found");
    req.authz(task);

    if (projectId && projectId !== task.project) {
      const project = await Project.findById(projectId);
      if (!project) throw new NotFoundException("Project not found");
      req.authz(project);

      await Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } }).session(session);

      project.tasks.push(task._id);

      await project.save({ session });

      updateData.project = project._id;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      updateData,
      { returnDocument: 'after' }
    ).session(session).lean();

    await session.commitTransaction();

    return res.success({ data: { task: updatedTask } })
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
})

const deleteTask = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction()

    const task = await Task.findById(req.params.id).lean();
    if (!task) throw new NotFoundException("Task not found");
    req.authz(task);

    await Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } }).session(session);

    await Task.findByIdAndDelete(task._id).session(session);

    await session.commitTransaction();

    return res.success({ data: {} })
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
})

export { getTasks, getTask, createTask, updateTask, deleteTask }
