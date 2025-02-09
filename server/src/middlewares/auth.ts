import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../utils/appError";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user._id)
    throw new UnauthorizedException("Unauthorized. Please log in.");

  next();
};
