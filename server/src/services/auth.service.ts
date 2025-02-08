import mongoose from "mongoose";
import User from "../models/user.models";
import Account from "../models/account.models";
import Workspace from "../models/workspace.models";
import { Roles } from "../enums/role.enum";
import Role from "../models/roles-permission.models";
import { NotFoundException, BadRequestException } from "../utils/appError";
import Member from "../models/member.models";
import { ProviderEnum } from "../enums/account-provider.enum";

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
}) => {
  const { provider, displayName, providerId, picture, email } = data;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name: displayName,
        profilePicture: picture,
      });

      await user.save({ session });

      const account = new Account({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });

      await account.save({ session });

      const workspace = new Workspace({
        name: "My Workspace",
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });

      await workspace.save({ session });

      const role = await Role.findOne({ name: Roles.OWNER }).session(session);

      if (!role) throw new NotFoundException("Owner role not found");

      const member = new Member({
        userId: user._id,
        workspaceId: workspace._id,
        role: role._id,
        joinedAt: new Date(),
      });

      await member.save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;

      await user.save({ session });
    }

    await session.commitTransaction();
    await session.endSession();

    return { user };
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const registerUserService = async (data: {
  email: string;
  name: string;
  password: string;
}) => {
  const { email, name, password } = data;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    let user = await User.findOne({ email });
    if (user) throw new BadRequestException("Email already exist");

    user = new User({
      email,
      name,
      password,
    });

    await user.save({ session });

    const account = new Account({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });

    await account.save({ session });

    const workspace = new Workspace({
      name: "My Workspace",
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });

    await workspace.save({ session });

    const role = await Role.findOne({ name: Roles.OWNER }).session(session);

    if (!role) throw new NotFoundException("Owner role not found");

    const member = new Member({
      userId: user._id,
      workspaceId: workspace._id,
      role: role._id,
      joinedAt: new Date(),
    });

    await member.save({ session });

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;

    await user.save({ session });

    await session.commitTransaction();
    await session.endSession();

    return { userId: user._id, workspaceId: workspace._id };
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  } finally {
    await session.endSession();
  }
};
