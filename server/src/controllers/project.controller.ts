import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { getMemberRoleInWorkspace } from "../services/member.service";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from "../validations/project.validation";
import { workspaceIdSchema } from "../validations/workspace.validations";
import { Permissions } from "../enums/role.enum";
import {
  createProjectService,
  getProjectByIdAndWorkspaceIdService,
  getProjectAnalyticsService,
  deleteProjectService,
  updateProjectService,
} from "../services/project.service";
import { roleGuard } from "../utils/roleGuard";
import { HTTPSTATUS } from "../configs/http.config";

export const createProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const { emoji, name, description, workspace } = createProjectSchema.parse(
      req.body,
    );

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspace);
    roleGuard(role, [Permissions.CREATE_PROJECT]);

    const { project } = await createProjectService(userId, workspace, {
      emoji,
      name,
      description,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Project created successfully",
      project,
    });
  },
);

export const getProjectByIdAndWorkspaceIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { project } = await getProjectByIdAndWorkspaceIdService(
      projectId,
      workspaceId,
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Project fetched successfully",
      project,
    });
  },
);

export const getProjectAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getProjectAnalyticsService(
      projectId,
      workspaceId,
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Project fetched successfully",
      analytics,
    });
  },
);

export const updateProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { emoji, name, description } = updateProjectSchema.parse(req.body);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const { project } = await updateProjectService(workspaceId, projectId, {
      emoji,
      name,
      description,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Project updated successfully",
      project,
    });
  },
);

export const deleteProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_PROJECT]);

    await deleteProjectService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project deleted successfully",
    });
  },
);
