import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import { User } from '../models/user.model.js';
import { Workspace } from '../models/workspace.model.js';
import { UnauthorizedException, BadRequestException } from '../utils/app-error.js';
import { config } from '../configs/app.config.js';

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

export { login, registerUser };
