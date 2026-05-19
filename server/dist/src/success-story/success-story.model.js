"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/success-story.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const successStorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    jobrole: {
        type: String,
        required: true,
        trim: true,
    },
    companyname: {
        type: String,
        required: true,
        trim: true,
    },
    mentorEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    offerletter: {
        type: String,
        default: null,
    },
}, { timestamps: true });
const SuccessStoryModel = model("SuccessStory", successStorySchema);
exports.default = SuccessStoryModel;
