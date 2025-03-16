import { ERROR_CODES } from "../utils/app-error.js";
import { STATUS } from "@/utils/constants.js";

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

export { format };
