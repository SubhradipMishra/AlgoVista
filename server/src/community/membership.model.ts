import { Document, Schema, model } from "mongoose";

export interface ICommunityMembership extends Document {
  community: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  createdAt: Date;
}

const communityMembershipSchema = new Schema<ICommunityMembership>(
  {
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

communityMembershipSchema.index({ community: 1, user: 1 }, { unique: true });

const CommunityMembershipModel = model<ICommunityMembership>(
  "CommunityMembership",
  communityMembershipSchema
);

export default CommunityMembershipModel;
