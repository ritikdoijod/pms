import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import { TaskStatusEnum } from "../enums/task.enum";
import Member from "../models/member.models";
import Role from "../models/roles-permission.models";
import Task from "../models/task.models";
import User from "../models/user.models";
import Workspace from "../models/workspace.models";
import { BadRequestException, NotFoundException } from "../utils/appError";
import Project from "../models/project.models";

export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string;
    description?: string | undefined;
  },
) => {
  const { name, description } = body;

  const user = await User.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const ownerRole = await Role.findOne({ name: Roles.OWNER });

  if (!ownerRole) throw new NotFoundException("Owner role not found");

  const workspace = new Workspace({
    name: name,
    description: description,
    owner: user._id,
  });

  await workspace.save();

  const member = new Member({
    userId: user._id,
    workspaceId: workspace._id,
  });

  await member.save();

  return {
    workspace,
  };
};

export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await Member.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  const workspaces = memberships.map((membership) => membership.workspaceId);

  return { workspaces };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) throw new NotFoundException("workspace not found");

  const members = await Member.find({ workspaceId }).populate("role");

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return {
    workspace: workspaceWithMembers,
  };
};

export const getWorkspaceMembersService = async (workspaceId: string) => {
  const members = await Member.find({ workspaceId })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

  const roles = await Role.find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();

  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();

  const totalTasks = await Task.countDocuments({
    workspace: workspaceId,
  });

  const overdueTask = await Task.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });

  const completedTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics = {
    totalTasks,
    overdueTask,
    completedTasks,
  };

  return { analytics };
};

export const changeMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string,
) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) throw new NotFoundException("Workspace not found");

  const role = await Role.findById(roleId);

  if (!role) throw new NotFoundException("Role not found");

  const member = await Member.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  });

  if (!member) throw new Error("Member not found in the workspace");

  member.role = role;

  await member.save();

  return { member };
};

export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string,
) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) throw new NotFoundException("workspace not found");

  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;

  await workspace.save();

  return { workspace };
};

export const deleteWorkspaceService = async (
  workspaceId: string,
  userId: string,
) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const workspace = await Workspace.findById(workspaceId).session(session);

    if (!workspace) throw new NotFoundException("workspace not found");

    if (workspace.owner.toString() != userId)
      throw new BadRequestException(
        "You are not authorized to delete this workspace",
      );

    const user = await User.findById(userId).session(session);

    if (!user) throw new NotFoundException("User not found");

    await Project.deleteMany({ workspace: workspace._id }).session(session);

    await Task.deleteMany({ workspace: workspace._id }).session(session);

    await Member.deleteMany({ workspace: workspace._id }).session(session);

    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await Member.findOne({ userId }).session(session);

      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;

      await user.save();
    }

    await workspace.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      currentWorkspace: user.currentWorkspace,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getAllProjectsInWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const totalCount = await Project.countDocuments({ workspace: workspaceId });

  const skip = (pageNumber - 1) * pageSize;

  const projects = await Project.find({ workspace: workspaceId })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
};
