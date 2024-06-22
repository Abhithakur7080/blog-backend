import { Schema, model } from "mongoose";

const blogCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BlogCategory = model("Blogcategory", blogCategorySchema);
