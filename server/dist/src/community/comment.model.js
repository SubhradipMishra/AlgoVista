"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    post: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    parentComment: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true },
}, { timestamps: true });
const CommentModel = (0, mongoose_1.model)("Comment", commentSchema);
exports.default = CommentModel;
