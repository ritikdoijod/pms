import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./configs/app.config";
import connectDatabase from "./configs/database.config";
import { HTTPSTATUS } from "./configs/http.config";
import { errorHandler } from "./middlewares/errorHandler";
import { asyncHandler } from "./middlewares/asyncHandler";

import "./configs/passport.config";

// import routes
import authRoutes from "./routes/auth.routes";
import passport from "passport";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded());

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "hello....",
    });
  }),
);

app.use(`${config.BASE_PATH}/auth`, authRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log("server listening....");
  connectDatabase();
});
