// @ts-nocheck
import { Schema, model, Document } from "mongoose";

export interface IReaction extends Document {
  post: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  type: 'like' | 'dislike';
  createdAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "dislike"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ReactionModel = model<IReaction>("Reaction", reactionSchema);
export default ReactionModel;
