"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const communityMembershipSchema = new mongoose_1.Schema({
    community: { type: mongoose_1.Schema.Types.ObjectId, ref: "Community", required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
communityMembershipSchema.index({ community: 1, user: 1 }, { unique: true });
const CommunityMembershipModel = (0, mongoose_1.model)("CommunityMembership", communityMembershipSchema);
exports.default = CommunityMembershipModel;
