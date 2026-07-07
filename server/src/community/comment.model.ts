// @ts-nocheck
import { Schema, model, Document } from "mongoose";

export interface IComment extends Document {
  post: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  parentComment?: Schema.Types.ObjectId | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const CommentModel = model<IComment>("Comment", commentSchema);
export default CommentModel;
