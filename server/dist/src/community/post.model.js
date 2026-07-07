"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    community: { type: mongoose_1.Schema.Types.ObjectId, ref: "Community", required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    mediaUrl: { type: String },
    mediaType: { type: String },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
}, { timestamps: true });
const PostModel = (0, mongoose_1.model)("Post", postSchema);
exports.default = PostModel;
