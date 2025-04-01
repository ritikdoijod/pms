import mongoose from "mongoose";
import { config } from "./app.config.js";
import { logger } from "./logger.config.js";
import {MongoMemoryReplSet} from "mongodb-memory-server"

const connectToDB = async () => {
  try {
    mongoose.set("strict", false);

    const mongoReplSet = await MongoMemoryReplSet.create({replSet: 2})
    await mongoose.connect(mongoReplSet.getUri());

    // await mongoose.connect(config.MONGO_URI);
    logger.info("Database connected.");
  } catch (error) {
    logger.fatal("Database connection failed");
    logger.fatal("ERROR: " + error);
    process.exit(1);
  }
};

export { connectToDB };
