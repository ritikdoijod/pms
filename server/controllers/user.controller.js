import { asyncHandler } from "@/middlewares/async-handler.middleware.js";
import { User } from "@/models/user.model.js";
import { BadRequestException } from "@/utils/app-error.js";
import { parseFilters } from "@/utils/filters.js";

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

export { getUser, updateUser };
