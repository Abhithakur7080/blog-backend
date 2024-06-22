import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

const validateMongoDBId = (id) => {
  //check id exist in database or not
  const isValid = mongoose.Types.ObjectId.isValid(id);
  // if not valid id then error exists
  if (!isValid) {
    throw new ApiError(401, "This id is not valid or not found");
  }
};

export { validateMongoDBId };
