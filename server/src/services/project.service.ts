import mongoose from "mongoose";
import { TaskStatusEnum } from "../enums/task.enum";
import Project from "../models/project.models";
import Task from "../models/task.models";
import { NotFoundException } from "../utils/appError";

export const createProjectService = async (
  userId: string,
  workspaceId: string,
  {
    emoji,
    name,
    description,
  }: { emoji?: string; name: string; description?: string },
) => {
  const project = new Project({
    ...(emoji && { emoji }),
    name,
    description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();

  return { project };
};

export const getProjectByIdAndWorkspaceIdService = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await Project.find({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project)
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace",
    );

  return { project };
};

export const getProjectAnalyticsService = async (
  workspaceId: string,
  projectId: string,
) => {
  const project = await Project.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString())
    throw new NotFoundException(
      "Project not found or does not belong to this workspace",
    );

  const currentDate = new Date();

  const taskAnalytics = await Task.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  const _analytics = taskAnalytics[0];

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return { analytics };
};

export const updateProjectService = async (
  projectId: string,
  workspaceId: string,
  {
    emoji,
    name,
    description,
  }: { emoji?: string; name?: string; description?: string },
) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, workspace: workspaceId },
    { emoji, name, description },
    { new: true },
  );

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace",
    );
  }

  return { project };
};

export const deleteProjectService = async (
  workspaceId: string,
  projectId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const project = await Project.findOneAndDelete({
      _id: projectId,
      workspace: workspaceId,
    }).session(session);

    if (!project) {
      throw new NotFoundException(
        "Project not found or does not belong to the specified workspace",
      );
    }

    await Task.deleteMany({ project: project._id }).session(session);

    await session.commitTransaction();
    session.endSession();
    return project;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
  }
};
