// @ts-nocheck
import { Schema, model } from 'mongoose';

const communitySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // optional cover image stored on Cloudinary
    coverImageUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Community = model('Community', communitySchema);
export default Community;
