"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const communitySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    creatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    // optional cover image stored on Cloudinary
    coverImageUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
}, { timestamps: true });
const Community = (0, mongoose_1.model)('Community', communitySchema);
exports.default = Community;
