"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
// Resource schema inside subtopics
const resourceSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
});
// Subtopic schema with multiple resources
const subtopicSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    resources: { type: [resourceSchema], default: [] },
});
// Main roadmap schema
const roadmapSchema = new mongoose_1.default.Schema({
    moduleTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
    },
    order: { type: Number, required: true, unique: true },
    subtopics: { type: [subtopicSchema], default: [] },
    tags: { type: [String], default: [] },
    learners: { type: Number, default: 0 },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
const RoadmapModel = (0, mongoose_1.model)("Roadmap", roadmapSchema);
exports.default = RoadmapModel;
