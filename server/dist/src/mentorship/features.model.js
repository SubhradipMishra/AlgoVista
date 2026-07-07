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
exports.MentorshipResourceModel = exports.MentorshipSubmissionModel = exports.MentorshipSessionModel = exports.MentorshipMessageModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
// 1. Direct Mentorship Chat Schema
const messageSchema = new mongoose_1.Schema({
    mentorshipId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Mentorship",
        required: true,
    },
    senderId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderRole: {
        type: String,
        enum: ["user", "mentor"],
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
}, { timestamps: true });
// 2. 1-on-1 Sessions Scheduler Schema
const sessionSchema = new mongoose_1.Schema({
    mentorshipId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Mentorship",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    joinUrl: {
        type: String,
        default: "https://meet.google.com/abc-defg-hij",
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled",
    },
}, { timestamps: true });
// 3. Project / Resume Submissions Schema
const submissionSchema = new mongoose_1.Schema({
    mentorshipId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Mentorship",
        required: true,
    },
    type: {
        type: String,
        enum: ["project", "resume"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "rejected"],
        default: "pending",
    },
    feedback: {
        type: String,
        default: "",
    },
}, { timestamps: true });
exports.MentorshipMessageModel = (0, mongoose_1.model)("MentorshipMessage", messageSchema);
exports.MentorshipSessionModel = (0, mongoose_1.model)("MentorshipSession", sessionSchema);
exports.MentorshipSubmissionModel = (0, mongoose_1.model)("MentorshipSubmission", submissionSchema);
// 4. Learning Resources Curation Schema
const resourceSchema = new mongoose_1.Schema({
    mentorshipId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Mentorship",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
}, { timestamps: true });
exports.MentorshipResourceModel = (0, mongoose_1.model)("MentorshipResource", resourceSchema);
