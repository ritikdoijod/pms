import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../configs/database.config";
import Role from "../models/roles-permission.models";
import { RolePermissions } from "../utils/role-permission";

const seedRoles = async () => {
  console.log("Seeding roles started");

  try {
    await connectDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Clearing existing roles");
    await Role.deleteMany({}, { session });

    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
      const permissions = RolePermissions[role];

      // NOTE: check if the role already exist
      const existingRole = await Role.findOne({ name: role }).session(session);

      if (!existingRole) {
        const newRole = new Role({
          name: role,
          permissions: permissions,
        });

        await newRole.save({ session });
        console.log(`Role ${role} added with permissions.`);
      } else {
        console.log(`Role ${role} already exist.`);
      }

      await session.commitTransaction();
      console.log("Transaction commited.");

      session.endSession();
      console.log("Session ended.");

      console.log("Seeding completed successfully.");
    }
  } catch (error) {
    console.error("Error during seeding: ", error);
    1;
  }
};

seedRoles().catch((error) => {
  console.error("Error running seed script: ", error);
});
