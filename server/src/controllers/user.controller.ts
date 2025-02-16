import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { getCurrentUserService } from "../services/user.service";
import { HTTPSTATUS } from "../configs/http.config";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  },
);
