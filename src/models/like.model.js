import { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  },
  {
    timestamps: true,
  }
);

export const Like = model("Like", likeSchema)
