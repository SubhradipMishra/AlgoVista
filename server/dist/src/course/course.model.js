"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const SubmoduleSchema = new mongoose_1.Schema({
    title: String,
    videoUrl: { type: String, default: null },
    pdfUrl: { type: String, default: null },
    description: { type: String, default: "" },
});
const ModuleSchema = new mongoose_1.Schema({
    title: String,
    submodules: [SubmoduleSchema],
});
const CourseSchema = new mongoose_1.Schema({
    title: { type: String, required: true, lowercase: true, unique: true },
    thumbnail: { type: String, default: null },
    roadmapImage: { type: String, default: null },
    description: { type: String, required: true },
    language: { type: String, default: "English" },
    tags: [{ type: String, required: true }],
    prerequisits: [{ type: String, required: true }],
    outCome: [{ type: String, required: true }],
    difficultyLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
    },
    courseType: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
    },
    price: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    duration: { type: String, required: true },
    instructor: [{ type: String, required: true }],
    isPublished: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["draft", "pending", "published"],
        default: "draft",
    },
    certificateAvailable: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    enrolledUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    category: { type: String, default: "general" },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    modules: [ModuleSchema],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Course", CourseSchema);
