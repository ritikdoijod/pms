import z from "zod";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { joinWorkspaceByInviteService } from "../services/member.service";
import { HTTPSTATUS } from "../configs/http.config";

export const joinWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const inviteCode = z.string().parse(req.params.code);
    const userId = req.user?._id;

    const { workspaceId, role } = await joinWorkspaceByInviteService(
      userId,
      inviteCode,
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Successfully joined the workspace",
      workspaceId,
      role,
    });
  },
);
