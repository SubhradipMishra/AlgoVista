"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResourceProgress = exports.getProgress = exports.saveProgress = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const roadmap_model_1 = __importDefault(require("../roadmap/roadmap.model"));
const roadmap_progress_model_1 = __importDefault(require("./roadmap-progress.model"));
const activity_model_1 = __importDefault(require("../activity/activity.model"));
const user_gamification_1 = require("../user/user.gamification");
// ==========================================================
// Save or Update Full Progress
// ==========================================================
const saveProgress = async (req, res) => {
    try {
        const { userId, roadmapId, subtopics } = req.body;
        if (!userId || !roadmapId || !Array.isArray(subtopics)) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
            });
        }
        let totalResources = 0;
        let totalCompleted = 0;
        subtopics.forEach((sub) => {
            const completedCount = sub.resources.filter((r) => r.completed).length;
            const total = sub.resources.length;
            sub.completedCount = completedCount;
            sub.totalResources = total;
            sub.progressPercent = total ? (completedCount / total) * 100 : 0;
            totalResources += total;
            totalCompleted += completedCount;
        });
        const overallProgress = totalResources > 0 ? (totalCompleted / totalResources) * 100 : 0;
        const progress = await roadmap_progress_model_1.default.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId), roadmapId: new mongoose_1.default.Types.ObjectId(roadmapId) }, { subtopics, overallProgress, updatedAt: Date.now() }, { new: true, upsert: true });
        const gamification = await (0, user_gamification_1.syncUserGamification)(userId);
        return res.status(200).json({ success: true, progress, gamification });
    }
    catch (err) {
        console.error("❌ Error saving progress:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.saveProgress = saveProgress;
// ==========================================================
// Get User's Progress for a Roadmap
// ==========================================================
const getProgress = async (req, res) => {
    try {
        const { userId, roadmapId } = req.params;
        console.log("📡 getProgress request:", { userId, roadmapId });
        if (!mongoose_1.default.Types.ObjectId.isValid(userId) || !mongoose_1.default.Types.ObjectId.isValid(roadmapId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId or roadmapId",
            });
        }
        const progress = await roadmap_progress_model_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            roadmapId: new mongoose_1.default.Types.ObjectId(roadmapId),
        });
        return res.status(200).json({ success: true, progress: progress || null });
    }
    catch (err) {
        console.error("❌ Error fetching progress:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.getProgress = getProgress;
// ==========================================================
// Update a Single Resource Progress
// ==========================================================
const updateResourceProgress = async (req, res) => {
    try {
        const { userId, roadmapId, subtopicName, resourceTitle, completed } = req.body;
        console.log("📡 updateResourceProgress body:", req.body);
        if (!userId || !roadmapId || !subtopicName || !resourceTitle) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        let progress = await roadmap_progress_model_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            roadmapId: new mongoose_1.default.Types.ObjectId(roadmapId),
        });
        // If no progress found → initialize
        if (!progress) {
            const roadmap = await roadmap_model_1.default.findById(roadmapId);
            if (!roadmap)
                return res.status(404).json({ success: false, message: "Roadmap not found" });
            const subtopics = roadmap.subtopics.map((sub) => ({
                subtopicName: sub.name,
                resources: sub.resources.map((r) => ({
                    title: r.title,
                    completed: false,
                })),
                completedCount: 0,
                totalResources: sub.resources.length,
                progressPercent: 0,
            }));
            progress = new roadmap_progress_model_1.default({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                roadmapId: new mongoose_1.default.Types.ObjectId(roadmapId),
                subtopics,
            });
        }
        const subtopic = progress.subtopics.find((s) => s.subtopicName === subtopicName);
        if (!subtopic)
            return res.status(404).json({ success: false, message: "Subtopic not found" });
        const resource = subtopic.resources.find((r) => r.title === resourceTitle);
        if (!resource)
            return res.status(404).json({ success: false, message: "Resource not found" });
        const wasCompleted = Boolean(resource.completed);
        // ✅ Toggle completion
        resource.completed = completed ?? !resource.completed;
        resource.completedAt = resource.completed ? new Date() : null;
        // Update progress values
        subtopic.completedCount = subtopic.resources.filter((r) => r.completed).length;
        subtopic.progressPercent = (subtopic.completedCount / subtopic.resources.length) * 100;
        const totalCompleted = progress.subtopics.reduce((acc, s) => acc + s.completedCount, 0);
        const totalResources = progress.subtopics.reduce((acc, s) => acc + s.totalResources, 0);
        progress.overallProgress =
            totalResources > 0 ? (totalCompleted / totalResources) * 100 : 0;
        progress.updatedAt = new Date();
        await progress.save();
        if (!wasCompleted && resource.completed) {
            await activity_model_1.default.create({
                userId,
                type: "roadmap-progress",
                route: `/roadmaps/${roadmapId}`,
                data: {
                    name: subtopicName,
                    description: `Completed roadmap resource: ${resourceTitle}`,
                },
            }).catch((activityError) => {
                console.error("Roadmap activity logging failed:", activityError);
            });
        }
        const gamification = await (0, user_gamification_1.syncUserGamification)(userId);
        return res.status(200).json({
            success: true,
            message: "Progress updated successfully",
            progress,
            gamification,
        });
    }
    catch (err) {
        console.error("❌ Error updating progress:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.updateResourceProgress = updateResourceProgress;
