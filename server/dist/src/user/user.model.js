"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const badgeSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "trophy" },
    earnedAt: { type: Date, default: Date.now },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "admin", "super-admin"],
        default: "user",
    },
    // Profile Details
    education: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    description: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    socialLinks: {
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        website: { type: String, default: "" },
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    rank: { type: String, default: "Rookie" },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: null },
    accuracy: { type: Number, default: 0 },
    globalRank: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    solved: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
    },
    badges: { type: [badgeSchema], default: [] },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt_1.default.hash(this.password, 12);
    next();
});
const UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = UserModel;
