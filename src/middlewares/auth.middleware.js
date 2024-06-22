import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //get token from cookies or header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    //if token not received
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    //token received then ->
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //after successfully get decoded token then find user from database
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    //if user not found in database
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    //user exists
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
