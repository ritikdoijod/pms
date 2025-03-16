import { logger } from "@/configs/logger.config.js";

const errorHandler = (error, req, res, next) => {
  logger.error(error);

  return res.error(error);
};

export { errorHandler };
