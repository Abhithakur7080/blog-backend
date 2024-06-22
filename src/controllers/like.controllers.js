import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateMongoDBId } from "../utils/validateMongoDBId.js";

const toggleCommentlike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  validateMongoDBId(commentId);

  const likedAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);
    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }
  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });
  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});
const toggleBloglike = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  validateMongoDBId(blogId);

  const likedAlready = await Like.findOne({
    blog: blogId,
    likedBy: req.user?._id,
  });
  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);
    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }
  await Like.create({
    blog: blogId,
    likedBy: req.user?._id,
  });
  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

export { toggleBloglike, toggleCommentlike };
