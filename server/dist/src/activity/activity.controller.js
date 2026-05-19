"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivity = exports.fetchActivityByUser = exports.fetchActivity = void 0;
const activity_model_1 = __importDefault(require("./activity.model"));
/**
 * Fetch all activities (Admin only)
 */
const fetchActivity = async (req, res) => {
    try {
        const activities = await activity_model_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json(activities);
    }
    catch (err) {
        console.error("FetchActivity Error:", err);
        return res.status(500).json({ message: "Failed to fetch activities" });
    }
};
exports.fetchActivity = fetchActivity;
/**
 * Fetch user-specific activities
 */
const fetchActivityByUser = async (req, res) => {
    try {
        const activities = await activity_model_1.default.find({ userId: req.user.id }).sort({
            createdAt: -1,
        }).limit(5);
        return res.status(200).json(activities);
    }
    catch (err) {
        console.error("FetchActivityByUser Error:", err);
        return res.status(500).json({ message: "Failed to fetch user activities" });
    }
};
exports.fetchActivityByUser = fetchActivityByUser;
/**
 * Create an activity (roadmap view, quiz attempt, visualizer run, etc.)
 */
const createActivity = async (req, res) => {
    try {
        console.log("Activity creation started...");
        console.log(req.body);
        const activity = new activity_model_1.default(req.body);
        await activity.save();
        return res.status(201).json({ message: "Activity successfully stored!" });
    }
    catch (err) {
        console.error("CreateActivity Error:", err);
        return res.status(500).json({ message: "Failed to create activity" });
    }
};
exports.createActivity = createActivity;
