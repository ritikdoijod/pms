import mongoose from "mongoose";
import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { Workspace } from "@/models/workspace.model.js";
import { User } from "@/models/user.model.js";
import { NotFoundException } from "@/utils/app-error.js";
import { STATUS } from "@/utils/constants.js"

const getAllWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ author: req.user?._id }).lean();

  return res.success({ data: { workspaces } });
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params?.id).lean();

  if (!workspace) throw new NotFoundException("Workspace not found");
  req.authz(workspace);

  return res.success({ data: { workspace } })
});

const createWorkspace = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { name, description } = req.body;

    const workspace = new Workspace({
      name,
      description,
      author: req.user?._id,
    });

    await workspace.save({ session });

    await User.findByIdAndUpdate(req.user?._id, {
      $push: { workspaces: workspace._id },
    }, { session }).lean();

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

  const updatedWorkspace = await Workspace.findByIdAndUpdate(workspace._id, {
    name,
    description
  }, {
    returnDocument: "after"
  }).lean();

  return res.success({
    data: { workspace: updatedWorkspace }
  })
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id).lean();

  if (!workspace) throw new NotFoundException("Workspace not found");
  req.authz(workspace);

  await Workspace.findByIdAndDelete(workspace._id);

  return res.success({})
});

export {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
};
