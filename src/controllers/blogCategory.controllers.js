import { BlogCategory } from "../models/blogCategory.js";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateMongoDBId } from "../utils/validateMongoDBId.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCatagory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) {
    throw new ApiError(401, "Title is required");
  }
  const categoryExist = await BlogCategory.findOne({ title: title });
  if (categoryExist) {
    throw new ApiError(401, "Title already exist");
  }
  const newCategory = await BlogCategory.create({
    title,
  });
  if (!newCategory) {
    throw new ApiError(500, "Failed to create blog category");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(201, newCategory, "Blog category created successfully")
    );
});
const updateCatagory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  validateMongoDBId(id);
  if (!title) {
    throw new ApiError(401, "title is required");
  }
  const categoryExist = await BlogCategory.findOne({ title: title });
  if (categoryExist) {
    throw new ApiError(401, "Title already exist");
  }
  const category = await BlogCategory.findById(id);
  if (!category) {
    throw new ApiError(404, "Blog Category not found");
  }
  const newCategory = await BlogCategory.findByIdAndUpdate(
    category?._id,
    {
      $set: {
        title,
      },
    },
    {
      new: true,
    }
  );
  if (!newCategory) {
    throw new ApiError(500, "Failed to update blog category");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(201, newCategory, "Blog category updated successfully")
    );
});

const deleteCatagory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const category = await BlogCategory.findById(id);
  if (!category) {
    throw new ApiError(404, "Blog Category not found");
  }
  await BlogCategory.findByIdAndDelete(id);

  await Blog.deleteMany({ category: id });

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Blog Category deleted successfully"));
});
const getAcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  const category = await BlogCategory.findById(id);
  if (!category) {
    throw new ApiError(404, "Blog Category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find({});
  return res
    .status(200)
    .json(
      new ApiResponse(200, categories, "All Categories fetched successfully")
    );
});
export {
  createCatagory,
  updateCatagory,
  deleteCatagory,
  getAcategory,
  getAllCategories,
};
