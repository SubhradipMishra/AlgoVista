"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMentorship = exports.fetchMentorship = void 0;
const mentorship_model_1 = __importDefault(require("./mentorship.model"));
/**
 * GET /mentorship
 * Query params:
 *  - userId
 *  - mentorId
 *  - status (optional)
 */
const fetchMentorship = async (req, res) => {
    try {
        const { userId, mentorId, status } = req.query;
        const filter = {};
        // 🔹 filter by user
        if (userId) {
            filter.user = userId;
        }
        // 🔹 filter by mentor
        if (mentorId) {
            filter.mentor = mentorId;
        }
        // 🔹 filter by status (active / expired)
        if (status) {
            filter.status = status;
        }
        const mentorShips = await mentorship_model_1.default.find(filter)
            .select("user mentor planId status startingDate endingDate")
            .sort({ createdAt: -1 });
        return res.status(200).json(mentorShips);
    }
    catch (err) {
        console.error("Fetch mentorship error:", err);
        return res.status(500).json({ message: "Failed to fetch mentorships" });
    }
};
exports.fetchMentorship = fetchMentorship;
const createMentorship = async (data) => {
    try {
        const newMentorship = new mentorship_model_1.default(data);
        await newMentorship.save();
        return newMentorship;
    }
    catch (err) {
        console.log(err);
    }
};
exports.createMentorship = createMentorship;
