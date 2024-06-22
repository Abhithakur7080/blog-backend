import { asyncHandler } from "../utils/asyncHandler.js";
import { Blog } from "../models/blog.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { validateMongoDBId } from "../utils/validateMongoDBId.js";
import { BlogCategory } from "../models/blogCategory.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    throw new ApiError(400, "All Fields are required");
  }
  const categoryExists = await BlogCategory.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, "Category not found");
  }

  const blog = await Blog.create({
    title,
    content,
    category,
    owner: req.user?._id,
  });
  if (!blog) {
    throw new ApiError(500, "Failed to create new blog please try again");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, blog, "Blog created successfully"));
});
const updateBlog = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const { blogId } = req.params;
  validateMongoDBId(blogId);
  if (!title || !content) {
    throw new ApiError(400, "All field are required");
  }
  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new Error(404, "Blog not found");
  }
  if (blog?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only owner can edit their blog");
  }
  const newBlog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $set: {
        title: title,
        content: content,
      },
    },
    {
      new: true,
    }
  );
  if (!newBlog) {
    throw new ApiError(500, "Failed to edit blog please try again later");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, newBlog, "Blog updated successfully"));
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  validateMongoDBId(blogId);

  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }
  if (blog?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only owner can delete their blog");
  }
  await Blog.findByIdAndDelete(blogId);
  await Like.deleteMany({ blog: blogId });
  await Comment.deleteMany({ blog: blogId });

  return res
    .status(200)
    .json(new ApiResponse(200, { blogId }, "Blog deleted successfully"));
});
const getOwnBlogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  validateMongoDBId(userId);
  const blogs = await Blog.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "blog",
        as: "likeDetails",
        pipeline: [
          {
            $project: {
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "blogcategories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
        pipeline: [
          {
            $project: {
              title: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likeDetails",
        },
        ownerDetails: {
          $first: "$ownerDetails",
        },
        categoryDetails: {
          $first: "$categoryDetails",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        title: 1,
        content: 1,
        category: "$categoryDetails.title",
        ownerDetails: 1,
        likesCount: 1,
        createdAt: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "Your all blogs fetched"));
});
const getUserBlogs = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateMongoDBId(userId);
  const blogs = await Blog.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "blog",
        as: "likeDetails",
        pipeline: [
          {
            $project: {
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "blogcategories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
        pipeline: [
          {
            $project: {
              title: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likeDetails",
        },
        ownerDetails: {
          $first: "$ownerDetails",
        },
        categoryDetails: {
          $first: "$categoryDetails",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?.id, "$likeDetails.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        title: 1,
        content: 1,
        category: "$categoryDetails.title",
        ownerDetails: 1,
        likesCount: 1,
        createdAt: 1,
        isLiked: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "User all blogs fetched"));
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const aggregateQuery = Blog.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "blog",
        as: "likeDetails",
        pipeline: [
          {
            $project: {
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "blogcategories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
        pipeline: [
          {
            $project: {
              title: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likeDetails",
        },
        ownerDetails: {
          $first: "$ownerDetails",
        },
        categoryDetails: {
          $first: "$categoryDetails",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        title: 1,
        content: 1,
        category: "$categoryDetails.title",
        ownerDetails: 1,
        likesCount: 1,
        createdAt: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const blogs = await Blog.aggregatePaginate(aggregateQuery, options);

  return res.status(200).json({
    status: 200,
    data: blogs,
    message: "All blogs fetched successfully",
  });
});

const getSingleBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  validateMongoDBId(blogId);

  const blog = await Blog.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(blogId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "blog",
        as: "likeDetails",
        pipeline: [
          {
            $project: {
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "blogcategories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
        pipeline: [
          {
            $project: {
              title: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likeDetails",
        },
        ownerDetails: {
          $first: "$ownerDetails",
        },
        categoryDetails: {
          $first: "$categoryDetails",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?.id, "$likeDetails.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        content: 1,
        category: "$categoryDetails.title",
        ownerDetails: 1,
        likesCount: 1,
        createdAt: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!blog) {
    return res.status(404).json({
      status: 404,
      message: "Blog not found",
    });
  }

  return res.status(200).json({
    status: 200,
    data: blog[0],
    message: "Blog fetched successfully",
  });
});

export {
  createBlog,
  updateBlog,
  deleteBlog,
  getUserBlogs,
  getAllBlogs,
  getSingleBlog,
  getOwnBlogs,
};
