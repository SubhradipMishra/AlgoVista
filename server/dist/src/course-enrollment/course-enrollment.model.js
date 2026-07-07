"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Default to 180 days access
    },
    status: {
        type: String,
        enum: ["enrolled", "completed", "ongoing", "expired"],
        default: "enrolled",
    },
}, { timestamps: true });
const CourseEnrollmentModel = (0, mongoose_1.model)('CourseEnrollment', schema);
exports.default = CourseEnrollmentModel;
