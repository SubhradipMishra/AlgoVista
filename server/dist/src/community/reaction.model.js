"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const reactionSchema = new mongoose_1.Schema({
    post: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "dislike"], required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
const ReactionModel = (0, mongoose_1.model)("Reaction", reactionSchema);
exports.default = ReactionModel;
