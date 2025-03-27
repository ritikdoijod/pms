import express from "express";

// import middlewares
import { format } from "./middlewares/format.middleware.js";
import { authn, authz } from "@/middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";

// import routes
import authRoutes from "@/routes/auth.route.js";
import userRoutes from "@/routes/user.route.js";
import workspaceRoutes from "@/routes/workspace.route.js";
import projectRoutes from "@/routes/project.route.js";
import taskRoutes from "@/routes/task.route.js";
import { parseFilters } from "./middlewares/query-parser.middleware.js";

const app = express();
app.use(express.json());

app.use(format({ apiVersion: "0.0.1" }));
app.use('/auth', authRoutes);

app.use(authn);
app.use(authz);
app.use(parseFilters)
app.use("/users", userRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

app.use(errorHandler);

export { app };
