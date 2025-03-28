import mongoose from "mongoose";
import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { Workspace } from "@/models/workspace.model.js";
import { User } from "@/models/user.model.js";
import { Project } from "@/models/project.model";
import { Task } from "@/models/task.model";
import { NotFoundException } from "@/utils/app-error.js";
import { STATUS } from "@/utils/constants.js";

const getAllWorkspaces = asyncHandler(async (req, res) => {
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

  const workspaces = await Workspace.find(
    query,
    projection,
    options
  );

  const totalRecords = await Workspace.countDocuments(query);

  return res.success({ data: { workspaces } });
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const { include = [] } = req.query;
  const workspace = await Workspace.findById(req.params?.id)
    .populate(include)
    .lean();

  if (!workspace) throw new NotFoundException("Workspace not found");
  req.authz(workspace);

  return res.success({ data: { workspace } });
});

const createWorkspace = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { name, description } = req.body;

    const workspace = new Workspace({
      name,
      description,
      author: req.user,
    });

    await workspace.save({ session });

    await User.findByIdAndUpdate(
      req.user,
      {
        $push: { workspaces: workspace._id },
      },
      { session }
    ).lean();

    await session.commitTransaction();

    return res.success({
      statusCode: STATUS.HTTP.CREATED,
      data: { workspace },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const workspace = await Workspace.findById(req.params.id).lean();

  if (!workspace) throw new NotFoundException("Workspace not found");
  req.authz(workspace);

  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    workspace._id,
    {
      name,
      description,
    },
    {
      returnDocument: "after",
    }
  ).lean();

  return res.success({
    data: { workspace: updatedWorkspace },
  });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const workspace = await Workspace.findById(req.params.id).lean();

    if (!workspace) throw new NotFoundException("Workspace not found");
    req.authz(workspace);

    await Task.deleteMany({ project: workspace.projects });

    await Project.deleteMany({ workspace: workspace._id });

    await Workspace.findByIdAndDelete(workspace._id).session(session);

    await session.commitTransaction();

    return res.success({ data: {} });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
};
