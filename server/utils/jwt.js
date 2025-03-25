import jwt from "jsonwebtoken";

import { config } from "@/configs/app.config";

// TODO: replace iss from env, update audience 
const signToken = (userId) => jwt.sign({ iss: 'localhost.com', sub: userId, aud: '' }, config.AUTH_SECRET);

const verifyToken = (token) => jwt.verify(token, config.AUTH_SECRET);

export { signToken, verifyToken }
