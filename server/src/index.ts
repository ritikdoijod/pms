import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./configs/app.config";
import connectDatabase from "./configs/database.config";
import { HTTPSTATUS } from "./configs/http.config";
import passport from "passport";
import morgan from "morgan";

import "./configs/passport.config";

// import middlewares
import { errorHandler } from "./middlewares/errorHandler";
import { asyncHandler } from "./middlewares/asyncHandler";
import { auth } from "./middlewares/auth";

// import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import workspaceRoutes from "./routes/workspace.routes";
import memberRoutes from "./routes/member.routes";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded());
app.use(morgan("combined"));

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

app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb: any) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb: any) => {
      cb();
    };
  }
  next();
});

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

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, auth, userRoutes);
app.use(`${BASE_PATH}/workspace`, workspaceRoutes);
app.use(`${BASE_PATH}/member`, memberRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log("server listening....");
  connectDatabase();
});
