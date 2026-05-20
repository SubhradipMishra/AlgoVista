import { Schema, model, Document } from "mongoose";

export interface IPost extends Document {
  community: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  mediaType?: string; // e.g., 'image', 'video'
  likesCount: number;
  dislikesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    mediaUrl: { type: String },
    mediaType: { type: String },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PostModel = model<IPost>("Post", postSchema);
export default PostModel;
