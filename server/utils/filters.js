/**
 * @param {Object} filters - Filters object
 * @returns {object}
 */

const parseFilters = (filters) => {
  return JSON.parse(
    JSON.stringify(filters).replace(
      /\b(eq|gte|gt|in|lte|lt|ne|nin)\b/g,
      (op) => `$${op}`,
    ),
  );
};

export { parseFilters };
