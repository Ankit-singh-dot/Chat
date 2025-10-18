import { response } from "express";
import jsonwebtoken, { verify } from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
const authToken = req.cookies?.auth_token;
if (!authToken) {
    return response(req, 401, "authentication token is not provided");
  }
  try {
    const decode = jsonwebtoken.verify(authToken, process.env.JWT_SECRET);
    req.user = decode;
    console, log(req.user);
    next();
  } catch (error) {
    console.error(error);
    return response(req, 401, "invalid or expired token");
  }
};
