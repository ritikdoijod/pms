import express from 'express';
import { format } from './middlewares/format.middleware.js';
import { authz, authn } from './middlewares/auth.middleware.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import router from './routes/auth.route.js';
import router$1 from './routes/user.route.js';
import router$2 from './routes/workspace.route.js';
import router$3 from './routes/project.route.js';
import router$4 from './routes/task.route.js';

const app = express();
app.use(express.json());

app.use(format({ apiVersion: "0.0.1" }));
app.use(authz);
app.use(`/auth`, router);

app.use(authn);
app.use("/users", router$1);
app.use("/workspaces", router$2);
app.use("/projects", router$3);
app.use("/tasks", router$4);

app.use(errorHandler);

export { app };
