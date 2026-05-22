"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProblemSubmissions = exports.getUserSubmissionsWithSpecificProblem = exports.getUserSubmissions = exports.prewarmExecutor = exports.getExecutorHealth = exports.createSubmissionMultiple = void 0;
const problem_model_1 = __importDefault(require("../problem/problem.model"));
const submission_model_1 = __importDefault(require("./submission.model"));
const dockerRunner_1 = require("../executor/dockerRunner");
const activity_model_1 = __importDefault(require("../activity/activity.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const user_gamification_1 = require("../user/user.gamification");
// Run code for all test cases
const createSubmissionMultiple = async (req, res) => {
    try {
        const { language_id, source_code, problemId, userId } = req.body;
        const previousUserState = userId
            ? await user_model_1.default.findById(userId).select("xp badges").lean()
            : null;
        const problem = await problem_model_1.default.findById(problemId);
        if (!problem)
            return res.status(404).json({ error: "Problem not found" });
        const results = await (0, dockerRunner_1.executeSubmissionInDocker)({
            languageId: Number(language_id),
            sourceCode: source_code,
            testCases: problem.testCases || [],
        });
        const allPassed = results.every((result) => result.status === "Accepted");
        const firstNonAccepted = results.find((result) => result.status !== "Accepted");
        const verdict = allPassed ? "Accepted" : firstNonAccepted?.status || "Wrong Answer";
        const score = allPassed ? 100 : 0;
        const submission = await submission_model_1.default.create({
            language_id,
            source_code,
            userId,
            problemId,
            results,
            verdict,
            score,
            finishedAt: new Date(),
        });
        if (userId) {
            await activity_model_1.default.create({
                userId,
                type: verdict === "Accepted" ? "problem-solved" : "submission-attempt",
                route: `/problems/${problemId}`,
                data: {
                    name: problem.title,
                    description: verdict === "Accepted"
                        ? `Solved a ${problem.difficulty || "coding"} challenge successfully.`
                        : `Attempted a ${problem.difficulty || "coding"} challenge and received ${verdict}.`,
                },
            }).catch((activityError) => {
                console.error("Submission activity logging failed:", activityError);
            });
        }
        const gamificationSnapshot = userId
            ? await (0, user_gamification_1.syncUserGamification)(userId)
            : null;
        const previousBadgeKeys = new Set((previousUserState?.badges || []).map((badge) => badge.key));
        const newBadges = gamificationSnapshot?.dashboard?.achievements?.filter((badge) => !previousBadgeKeys.has(badge.key)) || [];
        const xpDelta = Math.max(0, (gamificationSnapshot?.user?.xp || 0) - (previousUserState?.xp || 0));
        return res.status(200).json({
            submission,
            gamification: gamificationSnapshot
                ? {
                    user: gamificationSnapshot.user,
                    dashboard: gamificationSnapshot.dashboard,
                    xpDelta,
                    newBadges,
                }
                : null,
        });
    }
    catch (err) {
        const message = err?.message || "Submission failed";
        const statusCode = message.includes("Unsupported language_id") ? 400 : 500;
        return res.status(statusCode).json({ error: message });
    }
};
exports.createSubmissionMultiple = createSubmissionMultiple;
const getExecutorHealth = async (_req, res) => {
    try {
        const health = await (0, dockerRunner_1.checkDockerExecutorHealth)();
        return res.status(200).json(health);
    }
    catch (err) {
        return res.status(503).json({
            ok: false,
            error: err?.message || "Docker executor is unavailable",
        });
    }
};
exports.getExecutorHealth = getExecutorHealth;
const prewarmExecutor = async (req, res) => {
    try {
        const languageId = Number(req.body?.language_id ?? req.query?.language_id);
        if (!languageId) {
            return res.status(400).json({ ok: false, error: "language_id is required" });
        }
        const result = await (0, dockerRunner_1.prewarmDockerImage)(languageId);
        return res.status(200).json(result);
    }
    catch (err) {
        const message = err?.message || "Failed to prepare Docker executor";
        const statusCode = message.includes("Unsupported language_id") ? 400 : 503;
        return res.status(statusCode).json({ ok: false, error: message });
    }
};
exports.prewarmExecutor = prewarmExecutor;
// Get all submissions of a user
const getUserSubmissions = async (req, res) => {
    try {
        const submissions = await submission_model_1.default.find({
            userId: req.params.userId,
        })
            .populate("problemId", "title difficulty")
            .sort({ createdAt: -1 });
        res.json({ submissions });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserSubmissions = getUserSubmissions;
// Submissions filtered by user + problem
const getUserSubmissionsWithSpecificProblem = async (req, res) => {
    try {
        const { userId, problemId } = req.params;
        const filter = {};
        if (userId)
            filter.userId = userId;
        if (problemId)
            filter.problemId = problemId;
        const submissions = await submission_model_1.default.find(filter)
            .populate("problemId", "title difficulty")
            .sort({ createdAt: -1 });
        res.json({ submissions });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserSubmissionsWithSpecificProblem = getUserSubmissionsWithSpecificProblem;
// Get all submissions for a specific problem
const getProblemSubmissions = async (req, res) => {
    try {
        const submissions = await submission_model_1.default.find({
            problemId: req.params.problemId,
        })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.json({ submissions });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getProblemSubmissions = getProblemSubmissions;
