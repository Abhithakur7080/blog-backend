import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      defaultValue: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Blogcategory",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.plugin(mongooseAggregatePaginate);

export const Blog = model("Blog", blogSchema);
