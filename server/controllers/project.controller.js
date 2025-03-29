import mongoose from "mongoose";

import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { Project } from "@/models/project.model.js";
import { Workspace } from "@/models/workspace.model.js";
import { Task } from "@/models/task.model"
import { NotFoundException } from "@/utils/app-error.js";
import { STATUS } from "@/utils/constants";

const getProjects = asyncHandler(async (req, res) => {
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

  const projects = await Project.find(query, projection, options);

  const totalRecords = await Project.countDocuments(query);

  return res.success({
    data: { projects },
    meta: {
      totalRecords,
      totalPages: page && Math.ceil(totalRecords / size),
      page,
      size,
    },
  });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();

  if (!project) throw new NotFoundException("Project not found");

  req.authz(project);

  return res.success({ data: { project } });
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description, workspace: workspaceId } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) throw new NotFoundException("Workspace not found");

    req.authz(workspace);

    const project = new Project({
      name,
      description,
      workspace: workspace._id,
      author: req.user,
    });

    await project.save({ session });

    workspace.projects.push(project._id);

    await workspace.save({ session });

    await session.commitTransaction();

    return res.success({ statusCode: STATUS.HTTP.CREATED, data: { project } });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description, workspace: workspaceId } = req.body;
  const updateData = { name, description };

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const project = await Project.findById(req.params.id).lean();
    if (!project) throw new NotFoundException("Project not found");
    req.authz(project);

    if (workspaceId && workspaceId !== project.workspace) {
      const workspace = await Workspace.findById(workspaceId).lean();
      if (!workspace) throw new NotFoundException("Workspace not found");

      await Workspace.findByIdAndUpdate(project.workspace, {
        $pull: {
          projects: { $eq: project._id }
        }
      }).session(session);

      workspace.projects.push = project._id;

      await workspace.save({ session })

      updateData.workspace = req.authz(workspace);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      project._id,
      updateData,
      { returnDocument: "after" }
    ).session(session).lean();

    await session.commitTransaction();

    return res.success({ data: { project: updatedProject } });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const project = await Project.findById(req.params.id).lean();

    if (!project) throw new NotFoundException("Project not found");
    req.authz(project);

    await Workspace.findByIdAndUpdate(project.workspace, {
      $pull: {
        projects: { $eq: project._id }
      }
    }).session(session);

    await Task.deleteMany({ project: project._id }).session(session);

    await Project.findByIdAndDelete(project._id).session(session).lean();

    await session.commitTransaction()

    return res.success({ data: {} });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export { getProjects, getProject, createProject, updateProject, deleteProject };
