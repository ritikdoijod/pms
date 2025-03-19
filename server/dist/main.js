import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import pino from 'pino';
import z, { ZodError } from 'zod';
import mongoose from 'mongoose';
import { hash, verify } from 'argon2';
import { v7 } from 'uuid';

const STATUS = Object.freeze({
  HTTP: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  TASK: {
    TODO: 'TODO',
    IN_PROGRESS: "IN_PROGRESS",
    REVIEW: "REVIEW",
    DONE: "DONE",
    BACKLOG: "BACKLOG",
  }
});

const PRIORITY = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH"
});

const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
};

class AppError extends Error {
  constructor(statusCode, errorCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

class BadRequestException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, message, details);
  }
}

class UnauthorizedException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, message, details);
  }
}

class ForbiddenException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.FORBIDDEN, ERROR_CODES.FORBIDDEN, message, details);
  }
}

class NotFoundException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.NOT_FOUND, ERROR_CODES.NOT_FOUND, message, details);
  }
}

/**
 * Middleware to format API responses with a consistent structure.
 *
 * @param {Object} options - Configuration options for the middleware.
 * @param {string} options.apiVersion - The API version to include in the response metadata.
 * @returns {Function} An Express middleware function that enhances the response object.
 */

const format = ({ apiVersion }) => {
  return (req, res, next) => {
    /**
     * Sends a successful API response with a standardized structure.
     *
     * @param {Object} options - Options for the success response.
     * @param {number} [options.statusCode=STATUS.HTTP.OK] - The HTTP status code (defaults to 200).
     * @param {*} [options.data] - The data payload to include in the response.
     * @param {*} [options.included]
     */

    res.success = ({ statusCode = STATUS.HTTP.OK, data }) => {
      res.status(statusCode).json({
        status: "success",
        data,
        meta: {
          apiVersion,
          timestamp: req.timestamp,
        },
      });
    };

    /**
     * Sends a failure API response with a standardized structure.
     *
     * @param {Object} options - Options for the success response.
     * @param {number} [options.statusCode=STATUS.HTTP.INTERNAL_SERVER_ERROR] - The HTTP status code (defaults: 500).
     * @param {number} [options.errorCode=ERROR_CODES.INTERNAL_SERVER_ERROR] - The Error code (defaults: INTERNAL_SERVER_ERROR).
     * @param {string} [options.message] - The error message.
     * @param {details} [options.details] - Errors details.
     */
    res.error = ({
      statusCode = STATUS.HTTP.INTERNAL_SERVER_ERROR,
      errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
      message,
      details,
    }) => {
      res.status(statusCode).json({
        status: "error",
        error: {
          code: errorCode,
          message,
          details,
        },
        meta: {
          apiVersion,
          timestamp: req.timestamp,
        },
      });
    };

    next();
  };
};

const env = (key, defaultValue = "") => {
  const value = process.env[key];

  if (!value) {
    if (defaultValue) return defaultValue;

    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
};

const appConfig = () => {
  return {
    PORT: env("PORT", 8000),
    AUTH_SECRET: env("AUTH_SECRET"),
    MONGO_URI: env("MONGO_URI"),
  };
};

const config = appConfig();

const authn = (req, res, next) => {
  try {
    const { authorization } = req?.headers;
    if (!authorization) throw new UnauthorizedException("Unauthorized");

    const token = authorization.split(" ")[1];

    if (authorization.startsWith("Bearer")) {
      const decoded = jwt.verify(token, config.AUTH_SECRET);
      req.user = decoded.user;
      return next();
    }

    throw new UnauthorizedException("Unauthorized");
  } catch (error) {
    console.log(error);
    throw new UnauthorizedException("Unauthorized");
  }
};

const authz = (req, res, next) => {
  req.authz = (doc) => {
    if (doc.author.toString() === req.user?._id) return doc;

    throw new ForbiddenException('Forbidden')
  };

  next();
};

const logger = pino({
  transport: {
    target: "pino/file",
    options: {
      destination: "./logs/combined.log",
      append: true,
      mkdir: true,
    },
  },
});

const errorHandler = (error, req, res, next) => {
  logger.error(error);

  return res.error(error);
};

const validate = ({ params, headers, body }) => {
  return (req, res, next) => {
    try {
      if (params) req.params = params.parse(req.params);

      if (headers) req.headers = headers.parse(req.headers);

      if (body) req.body = body.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          STATUS.HTTP.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR,
          "Validation error occured",
          error?.issues?.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        );
      }
    }
  };
};

const asyncHandler = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);
  }
};

const userSchema$1 = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      select: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema$1.pre("save", async function (next) {
  if (this.isModified("password") && this.password)
    this.password = await hash(this.password);

  next();
});

userSchema$1.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema$1.methods.verifyPassword = async function (value) {
  return await verify(this.password, value);
};

const User = mongoose.model("User", userSchema$1);

const generateInviteCode = () => v7().replace(/-/g, "").substring(0, 8);

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: generateInviteCode,
    },
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    }]
  },
  {
    timestamps: true,
  },
);

const Workspace = mongoose.model("Workspace", workspaceSchema);

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check if user exist
  const user = await User.findOne({ email });

  if (!user) throw new UnauthorizedException("Invalid Credentials");

  if (await user.verifyPassword(password)) {
    const token = jwt.sign({ user }, config.AUTH_SECRET);

    return res.success({ data: { token, user } });
  }

  throw new UnauthorizedException("Invalid Credentials");
});

const registerUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { name, email, password } = req.body;

    // check if user already exist with email
    const existingUser = await User.findOne({ email });

    if (existingUser) throw new BadRequestException("Email already exist");

    const newUser = new User({
      name,
      email,
      password,
    });

    const workspace = new Workspace({
      name: "My Workspace",
      description: "Default workspace created for user",
      author: newUser?._id,
    });

    workspace.save({ session });

    newUser.currentWorkspace = workspace?._id;
    newUser.workspaces = [workspace?._id];

    await newUser.save({ session });
    await session.commitTransaction();

    return res.success({
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const userSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email("Invalid email address").min(1).max(255),
  password: z.string().trim().min(6).max(255),
});

const updateUserSchema = userSchema.partial();

const registerSchema = userSchema.extend({
  confirmPassword: z.string().trim().max(255),
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
  message: "Password must match!",
  path: ["confirmPassword"],
});

const loginSchema = userSchema.pick({ email: true, password: true });

const router$4 = Router();

router$4.post("/register", validate({ body: registerSchema }), registerUser);
router$4.post("/login", validate({ body: loginSchema }), login);

// const getAllUsers = asyncHandler(async (req, res) => {
//   const { include = [], filters } = req.query;
//   const users = await User.find(parseFilters(filters)).populate(include);
//
//   return res.success({ data: { users } });
// });

const getUser = asyncHandler(async (req, res) => {
  const { include = [] } = req.query;

  const user = await User.findById(req.user?._id).populate(include);

  if (!user) throw new BadRequestException("User not found");

  return res.success({ data: { user } });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findByIdAndUpdate(req.user?._id, {
    name,
    email,
    password,
  }, {
    returnDocument: "after",
  });

  if (!user) throw new BadRequestException("User not found");

  return res.success({ data: { user } });
});

const router$3 = Router();

router$3.get("/:id", getUser);
router$3.patch("/:id", validate({ body: updateUserSchema }), updateUser);

const getAllWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ author: req.user?._id }).lean();

  return res.success({ data: { workspaces } });
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params?.id).lean();

  if (!workspace) throw new NotFoundException("Workspace not found");
  req.authz(workspace);

  return res.success({ data: { workspace } })
});

const createWorkspace = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { name, description } = req.body;

    const workspace = new Workspace({
      name,
      description,
      author: req.user?._id,
    });

    await workspace.save({ session });

    await User.findByIdAndUpdate(req.user?._id, {
      $push: { workspaces: workspace._id },
    }, { session }).lean();

    await session.commitTransaction();

    return res.success({
      statusCode: STATUS.HTTP.CREATED,
      data: { workspace },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const workspace = await Workspace.findById(req.params.id).lean();

  if (!workspace) throw new NotFoundException("Workspace not found");
  req.authz(workspace);

  const updatedWorkspace = await Workspace.findByIdAndUpdate(workspace._id, {
    name,
    description
  }, {
    returnDocument: "after"
  }).lean();

  return res.success({
    data: { workspace: updatedWorkspace }
  })
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id).lean();

  if (!workspace) throw new NotFoundException("Workspace not found");
  req.authz(workspace);

  await Workspace.findByIdAndDelete(workspace._id);

  return res.success({})
});

const router$2 = Router();

router$2.get("/", getAllWorkspaces);
router$2.get("/:id", getWorkspaceById);
router$2.post("/", createWorkspace);
router$2.patch("/:id", updateWorkspace);
router$2.delete("/:id", deleteWorkspace);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    }]
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model('Project', projectSchema);

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ author: req.user?._id }).lean();

  return res.success({ data: { projects } })
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();

  if (!project) throw NotFoundException("Project not found")

  req.authz(project);

  return res.success({ data: { project } })
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description, workspace: workspaceId } = req.body;

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) throw NotFoundException('Workspace not found');

  req.authz(workspace);

  const project = new Project({ name, description, workspace: workspace._id, author: req.user?._id });

  await project.save();

  return res.success({ data: { project } })
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description, workspace: workspaceId } = req.body;
  const updateData = { name, description };

  const project = await Project.findById(req.params.id).lean();
  if (!project) throw NotFoundException("Project not found")
  req.authz(project);

  if (workspaceId) {
    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) throw NotFoundException('Workspace not found');
    updateData.workspace = req.authz(workspace);
  }

  const updatedProject = await Project.findByIdAndUpdate(project._id, updateData, { returnDocument: 'after' }).lean();

  return res.success({ data: { project: updatedProject } })
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();

  if (!project) throw NotFoundException("Project not found")
  req.authz(project);

  await Project.findByIdAndDelete(project._id).lean();

  return res.success({})
});

const router$1 = Router();

router$1.get('/', getProjects);
router$1.get('/:id', getProject);
router$1.post('/', createProject);
router$1.patch('/:id', updateProject);
router$1.delete('/:id', deleteProject);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUS.TASK),
      default: STATUS.TASK.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY),
      default: PRIORITY.LOW,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", taskSchema);

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ author: req.user._id }).lean();

  return res.success({ data: { tasks } })
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();

  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  return res.success({ data: { task } })
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, workspace: workspaceId, status, priority } = req.body;

  console.log("test");

  const [project, workspace] = await Promise.all([
    Workspace.findById(workspaceId).lean(),
    Project.findById(projectId).lean()
  ]);

  if (!workspace) throw new NotFoundException("Workspace not found")
  req.authz(workspace);

  if (!project) throw new NotFoundException("Project not found");
  req.authz(project);

  console.log(project);

  if (project.workspace.toString() !== workspace._id)
    throw new BadRequestException('Project does not belongs to the workspace.');

  const task = new Task({
    title,
    description,
    project: project._id,
    workspace: workspace._id,
    status,
    priority
  });

  await task.save();

  return res.success({ status: STATUS.HTTP.CREATED, data: { task } })
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, workspace: workspaceId, status, priority } = req.body;
  const updateData = {
    title,
    description,
    status,
    priority
  };

  const task = await Task.findById(req.params.id).lean();
  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  if (projectId) {
    const project = await Project.findById(projectId).lean();
    if (!project) throw new NotFoundException("Project not found");
    req.authz(project);
    updateData.project = project._id;
  }

  if (workspaceId) {
    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) throw new NotFoundException("Workspace not found");
    req.authz(workspace);
    updateData.workspace = workspace._id;
  }

  const updatedTask = Task.findByIdAndUpdate(task._id, updateData, { returnDocument: 'after' }).lean();

  return res.success({ data: { task: updatedTask } })
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  if (!task) throw new NotFoundException("Task not found");
  req.authz(task);

  await Task.findByIdAndDelete(task._id);

  return res.success({})
});

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

const app = express();
app.use(express.json());

app.use(format({ apiVersion: "0.0.1" }));
app.use(authz);
app.use(`/auth`, router$4);

app.use(authn);
app.use("/users", router$3);
app.use("/workspaces", router$2);
app.use("/projects", router$1);
app.use("/tasks", router);

app.use(errorHandler);

const connectToDB = async () => {
  try {
    mongoose.set("strict", false);
    await mongoose.connect(config.MONGO_URI);
    logger.info("Database connected.");
  } catch (error) {
    logger.fatal("Database connection failed");
    logger.fatal("ERROR: " + error);
    process.exit(1);
  }
};

app.listen(config.PORT, () => {
  logger.info(`Server is running at http://localhost:${config.PORT}`);
  connectToDB();
});
