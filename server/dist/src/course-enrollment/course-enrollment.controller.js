"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllEnrolledUsers = exports.fetchEnrolledCourse = exports.createEnrollment = void 0;
const course_enrollment_model_1 = __importDefault(require("./course-enrollment.model"));
// =========================
// Create Enrollment
// =========================
const createEnrollment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "courseId is required" });
        }
        // Check if user already enrolled
        const existing = await course_enrollment_model_1.default.findOne({ userId, courseId });
        if (existing) {
            return res.status(200).json({
                message: "Already enrolled",
                enrolled: true,
                enrollment: existing,
            });
        }
        const enrollment = await course_enrollment_model_1.default.create({
            userId,
            courseId,
            enrolledAt: Date.now(),
        });
        return res.status(201).json({
            message: "Enrollment successful",
            enrolled: true,
            enrollment,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};
exports.createEnrollment = createEnrollment;
const fetchEnrolledCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const courses = await course_enrollment_model_1.default
            .find({ userId })
            .lean();
        return res.status(200).json({
            success: true,
            count: courses.length,
            courses,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};
exports.fetchEnrolledCourse = fetchEnrolledCourse;
const fetchAllEnrolledUsers = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "courseId is required" });
        }
        const users = await course_enrollment_model_1.default
            .find({ courseId })
            .lean();
        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};
exports.fetchAllEnrolledUsers = fetchAllEnrolledUsers;
