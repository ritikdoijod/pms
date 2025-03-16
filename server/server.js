import { app } from "@/app.js";
import { config } from "./configs/app.config.js";
import { connectToDB } from "./configs/db.config.js";
import { logger } from "./configs/logger.config.js";

app.listen(config.PORT, () => {
  logger.info(`Server is running at http://localhost:${config.PORT}`);
  connectToDB();
});
