const parseFilters = (req, res, next) => {
  req.query.filters = JSON.parse(
    JSON.stringify(req.query.filters).replace(
      /\b(eq|gte|gt|in|lte|lt|ne|nin|and|not|nor|or|exists|type|expr|jsonSchema|mod|regex|text|where|all|elemMatch|size)\b/g,
      (op) => `$${op}`
    )
  );

  next();
};

export { parseFilters };
