import jwt from 'jsonwebtoken';
import { config } from '../configs/app.config.js';
import { ForbiddenException, UnauthorizedException } from '../utils/app-error.js';

const authn = (req, res, next) => {
  try {
    const { authorization } = req?.headers;
    if (!authorization) throw new UnauthorizedException("Unauthorized");

    const token = authorization.split(" ")[1];

    if (authorization.startsWith("Bearer")) {
      const decoded = jwt.verify(token, config.AUTH_SECRET);
      req.user = decoded.user;
      return next();
    }

    throw new UnauthorizedException("Unauthorized");
  } catch (error) {
    console.log(error);
    throw new UnauthorizedException("Unauthorized");
  }
};

const authz = (req, res, next) => {
  req.authz = (doc) => {
    if (doc.author.toString() === req.user?._id) return doc;

    throw new ForbiddenException('Forbidden')
  };

  next();
};

export { authn, authz };
