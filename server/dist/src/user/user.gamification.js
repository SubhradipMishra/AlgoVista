"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUserGamification = void 0;
// @ts-nocheck
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("./user.model"));
const submission_model_1 = __importDefault(require("../submission/submission.model"));
const problem_model_1 = __importDefault(require("../problem/problem.model"));
const roadmap_progress_model_1 = __importDefault(require("../roadmap-progress/roadmap-progress.model"));
const certificate_model_1 = __importDefault(require("../certificate/certificate.model"));
const activity_model_1 = __importDefault(require("../activity/activity.model"));
const membership_model_1 = __importDefault(require("../community/membership.model"));
const post_model_1 = __importDefault(require("../community/post.model"));
const comment_model_1 = __importDefault(require("../community/comment.model"));
const DAY_MS = 24 * 60 * 60 * 1000;
const LEVEL_XP_STEP = 1000;
const PROBLEM_XP = {
    Easy: 120,
    Medium: 260,
    Hard: 420,
};
const ROADMAP_RESOURCE_XP = 35;
const ROADMAP_COMPLETION_XP = 250;
const CERTIFICATE_XP = 180;
const COMMUNITY_JOIN_XP = 40;
const COMMUNITY_POST_XP = 25;
const COMMUNITY_COMMENT_XP = 10;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const toDayKey = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    .toISOString()
    .slice(0, 10);
const toMonthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
const fromDayKeyToNumber = (dayKey) => Math.floor(new Date(`${dayKey}T00:00:00.000Z`).getTime() / DAY_MS);
const getLevelFromXP = (xp) => Math.max(1, Math.floor(xp / LEVEL_XP_STEP) + 1);
const getRankFromLevel = (level) => {
    if (level >= 10)
        return "Legend";
    if (level >= 7)
        return "Elite";
    if (level >= 5)
        return "Architect";
    if (level >= 3)
        return "Challenger";
    return "Rookie";
};
const roundPercent = (value) => Math.round(value * 100) / 100;
const computeStreaks = (dayKeys) => {
    if (!dayKeys.length) {
        return { streak: 0, longestStreak: 0 };
    }
    const uniqueDayNumbers = [...new Set(dayKeys)]
        .map(fromDayKeyToNumber)
        .sort((a, b) => a - b);
    let longestStreak = 1;
    let currentRun = 1;
    for (let i = 1; i < uniqueDayNumbers.length; i += 1) {
        if (uniqueDayNumbers[i] - uniqueDayNumbers[i - 1] === 1) {
            currentRun += 1;
        }
        else {
            longestStreak = Math.max(longestStreak, currentRun);
            currentRun = 1;
        }
    }
    longestStreak = Math.max(longestStreak, currentRun);
    const todayNumber = fromDayKeyToNumber(toDayKey(new Date()));
    const latestDay = uniqueDayNumbers[uniqueDayNumbers.length - 1];
    if (latestDay < todayNumber - 1) {
        return { streak: 0, longestStreak };
    }
    let streak = 1;
    for (let i = uniqueDayNumbers.length - 1; i > 0; i -= 1) {
        if (uniqueDayNumbers[i] - uniqueDayNumbers[i - 1] === 1) {
            streak += 1;
        }
        else {
            break;
        }
    }
    return { streak, longestStreak };
};
const createBadge = (key, label, description, icon, earnedAt) => {
    if (!earnedAt)
        return null;
    return { key, label, description, icon, earnedAt };
};
const buildMonthlyXPSeries = (xpEvents) => {
    const now = new Date();
    const firstVisibleMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const monthlyGains = new Map();
    let cumulativeBeforeWindow = 0;
    xpEvents.forEach((event) => {
        const monthKey = toMonthKey(event.date);
        if (event.date < firstVisibleMonth) {
            cumulativeBeforeWindow += event.amount;
            return;
        }
        monthlyGains.set(monthKey, (monthlyGains.get(monthKey) || 0) + event.amount);
    });
    let runningXP = cumulativeBeforeWindow;
    return Array.from({ length: 6 }, (_, index) => {
        const date = new Date(Date.UTC(firstVisibleMonth.getUTCFullYear(), firstVisibleMonth.getUTCMonth() + index, 1));
        const monthKey = toMonthKey(date);
        runningXP += monthlyGains.get(monthKey) || 0;
        return {
            month: MONTH_LABELS[date.getUTCMonth()],
            xp: runningXP,
        };
    });
};
const buildWeeklyActivitySeries = (xpByDay, solvedByDay) => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (6 - index)));
        const dayKey = toDayKey(date);
        return {
            day: DAY_LABELS[date.getUTCDay()],
            solved: solvedByDay.get(dayKey) || 0,
            xp: xpByDay.get(dayKey) || 0,
        };
    });
};
const syncUserGamification = async (userId) => {
    const normalizedUserId = new mongoose_1.default.Types.ObjectId(userId.toString());
    const [user, submissions, progressDocs, certificates, memberships, posts, comments, activities,] = await Promise.all([
        user_model_1.default.findById(normalizedUserId),
        submission_model_1.default.find({ userId: normalizedUserId }).sort({ createdAt: 1 }).lean(),
        roadmap_progress_model_1.default.find({ userId: normalizedUserId }).lean(),
        certificate_model_1.default.find({ userId: normalizedUserId }).sort({ issuedAt: 1 }).lean(),
        membership_model_1.default.find({ user: normalizedUserId }).sort({ createdAt: 1 }).lean(),
        post_model_1.default.find({ author: normalizedUserId }).sort({ createdAt: 1 }).lean(),
        comment_model_1.default.find({ author: normalizedUserId }).sort({ createdAt: 1 }).lean(),
        activity_model_1.default.find({ userId: normalizedUserId }).sort({ createdAt: 1 }).lean(),
    ]);
    if (!user)
        return null;
    const uniqueAcceptedProblemIds = [
        ...new Set(submissions
            .filter((submission) => submission.verdict === "Accepted" && submission.problemId)
            .map((submission) => submission.problemId.toString())),
    ];
    const problems = await problem_model_1.default.find({ _id: { $in: uniqueAcceptedProblemIds } })
        .select("_id title difficulty")
        .lean();
    const problemMap = new Map(problems.map((problem) => [problem._id.toString(), problem]));
    const solved = { easy: 0, medium: 0, hard: 0 };
    const xpEvents = [];
    const xpByDay = new Map();
    const solvedByDay = new Map();
    const activeDayKeys = new Set();
    let totalXP = 0;
    let completedResources = 0;
    let completedRoadmaps = 0;
    let lastActiveAt = null;
    const acceptedByProblem = new Map();
    submissions.forEach((submission) => {
        if (submission.verdict === "Accepted" && submission.problemId) {
            const problemId = submission.problemId.toString();
            if (!acceptedByProblem.has(problemId)) {
                acceptedByProblem.set(problemId, submission);
            }
        }
    });
    acceptedByProblem.forEach((submission, problemId) => {
        const problem = problemMap.get(problemId);
        const difficulty = problem?.difficulty || "Easy";
        const difficultyKey = difficulty.toLowerCase();
        if (solved[difficultyKey] !== undefined) {
            solved[difficultyKey] += 1;
        }
        const xpAmount = PROBLEM_XP[difficulty] || PROBLEM_XP.Easy;
        const eventDate = new Date(submission.createdAt);
        const dayKey = toDayKey(eventDate);
        totalXP += xpAmount;
        xpEvents.push({ date: eventDate, amount: xpAmount });
        xpByDay.set(dayKey, (xpByDay.get(dayKey) || 0) + xpAmount);
        solvedByDay.set(dayKey, (solvedByDay.get(dayKey) || 0) + 1);
        activeDayKeys.add(dayKey);
        if (!lastActiveAt || eventDate > lastActiveAt) {
            lastActiveAt = eventDate;
        }
    });
    progressDocs.forEach((progress) => {
        let roadmapHasCompletionBonus = false;
        (progress.subtopics || []).forEach((subtopic) => {
            (subtopic.resources || []).forEach((resource) => {
                if (!resource.completed || !resource.completedAt)
                    return;
                const eventDate = new Date(resource.completedAt);
                const dayKey = toDayKey(eventDate);
                completedResources += 1;
                totalXP += ROADMAP_RESOURCE_XP;
                xpEvents.push({ date: eventDate, amount: ROADMAP_RESOURCE_XP });
                xpByDay.set(dayKey, (xpByDay.get(dayKey) || 0) + ROADMAP_RESOURCE_XP);
                activeDayKeys.add(dayKey);
                if (!lastActiveAt || eventDate > lastActiveAt) {
                    lastActiveAt = eventDate;
                }
            });
        });
        if (Number(progress.overallProgress) >= 100 && !roadmapHasCompletionBonus) {
            completedRoadmaps += 1;
            roadmapHasCompletionBonus = true;
            const completionDate = new Date(progress.updatedAt || progress.createdAt || new Date());
            const dayKey = toDayKey(completionDate);
            totalXP += ROADMAP_COMPLETION_XP;
            xpEvents.push({ date: completionDate, amount: ROADMAP_COMPLETION_XP });
            xpByDay.set(dayKey, (xpByDay.get(dayKey) || 0) + ROADMAP_COMPLETION_XP);
            activeDayKeys.add(dayKey);
            if (!lastActiveAt || completionDate > lastActiveAt) {
                lastActiveAt = completionDate;
            }
        }
    });
    certificates.forEach((certificate) => {
        const eventDate = new Date(certificate.issuedAt || certificate.createdAt || new Date());
        const dayKey = toDayKey(eventDate);
        totalXP += CERTIFICATE_XP;
        xpEvents.push({ date: eventDate, amount: CERTIFICATE_XP });
        xpByDay.set(dayKey, (xpByDay.get(dayKey) || 0) + CERTIFICATE_XP);
        activeDayKeys.add(dayKey);
        if (!lastActiveAt || eventDate > lastActiveAt) {
            lastActiveAt = eventDate;
        }
    });
    memberships.forEach((membership) => {
        const eventDate = new Date(membership.createdAt);
        const dayKey = toDayKey(eventDate);
        totalXP += COMMUNITY_JOIN_XP;
        xpEvents.push({ date: eventDate, amount: COMMUNITY_JOIN_XP });
        xpByDay.set(dayKey, (xpByDay.get(dayKey) || 0) + COMMUNITY_JOIN_XP);
        activeDayKeys.add(dayKey);
        if (!lastActiveAt || eventDate > lastActiveAt) {
            lastActiveAt = eventDate;
        }
    });
    posts.forEach((post) => {
        const eventDate = new Date(post.createdAt);
        const dayKey = toDayKey(eventDate);
        totalXP += COMMUNITY_POST_XP;
        xpEvents.push({ date: eventDate, amount: COMMUNITY_POST_XP });
        xpByDay.set(dayKey, (xpByDay.get(dayKey) || 0) + COMMUNITY_POST_XP);
        activeDayKeys.add(dayKey);
        if (!lastActiveAt || eventDate > lastActiveAt) {
            lastActiveAt = eventDate;
        }
    });
    comments.forEach((comment) => {
        const eventDate = new Date(comment.createdAt);
        const dayKey = toDayKey(eventDate);
        totalXP += COMMUNITY_COMMENT_XP;
        xpEvents.push({ date: eventDate, amount: COMMUNITY_COMMENT_XP });
        xpByDay.set(dayKey, (xpByDay.get(dayKey) || 0) + COMMUNITY_COMMENT_XP);
        activeDayKeys.add(dayKey);
        if (!lastActiveAt || eventDate > lastActiveAt) {
            lastActiveAt = eventDate;
        }
    });
    activities.forEach((activity) => {
        const eventDate = new Date(activity.createdAt);
        activeDayKeys.add(toDayKey(eventDate));
        if (!lastActiveAt || eventDate > lastActiveAt) {
            lastActiveAt = eventDate;
        }
    });
    const totalSolved = solved.easy + solved.medium + solved.hard;
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter((submission) => submission.verdict === "Accepted").length;
    const accuracy = totalSubmissions ? roundPercent((acceptedSubmissions / totalSubmissions) * 100) : 0;
    const { streak, longestStreak } = computeStreaks([...activeDayKeys]);
    const level = getLevelFromXP(totalXP);
    const rank = getRankFromLevel(level);
    const firstSolvedAt = acceptedByProblem.size
        ? new Date([...acceptedByProblem.values()][0].createdAt)
        : null;
    const firstHardSolvedAt = [...acceptedByProblem.values()].find((submission) => {
        const problem = problemMap.get(submission.problemId.toString());
        return problem?.difficulty === "Hard";
    })?.createdAt || null;
    const firstRoadmapCompleteAt = progressDocs.find((progress) => Number(progress.overallProgress) >= 100)?.updatedAt || null;
    const firstCertificateAt = certificates[0]?.issuedAt || certificates[0]?.createdAt || null;
    const firstCommunityContributionAt = posts[0]?.createdAt || comments[0]?.createdAt || memberships[0]?.createdAt || null;
    const badges = [
        createBadge("first-blood", "First Blood", "Solved your first coding challenge.", "bolt", firstSolvedAt ? new Date(firstSolvedAt) : null),
        createBadge("problem-crusher", "Problem Crusher", "Solved at least five coding challenges.", "code", totalSolved >= 5 ? lastActiveAt : null),
        createBadge("hard-mode", "Hard Mode", "Cracked your first hard-level problem.", "fire", firstHardSolvedAt ? new Date(firstHardSolvedAt) : null),
        createBadge("streak-keeper", "Streak Keeper", "Maintained a learning streak for 3 days.", "calendar", longestStreak >= 3 ? lastActiveAt : null),
        createBadge("streak-legend", "Streak Legend", "Maintained a learning streak for 7 days.", "trophy", longestStreak >= 7 ? lastActiveAt : null),
        createBadge("pathfinder", "Pathfinder", "Completed five roadmap resources.", "compass", completedResources >= 5 ? lastActiveAt : null),
        createBadge("roadmap-finisher", "Roadmap Finisher", "Completed a full roadmap.", "flag", firstRoadmapCompleteAt ? new Date(firstRoadmapCompleteAt) : null),
        createBadge("certified", "Certified Learner", "Unlocked your first AlgoVista certificate.", "shield", firstCertificateAt ? new Date(firstCertificateAt) : null),
        createBadge("community-voice", "Community Voice", "Joined the community and started contributing.", "message", firstCommunityContributionAt ? new Date(firstCommunityContributionAt) : null),
        createBadge("elite-coder", "Elite Coder", "Crossed 3000 XP.", "crown", totalXP >= 3000 ? lastActiveAt : null),
    ].filter(Boolean);
    const weeklyActivity = buildWeeklyActivitySeries(xpByDay, solvedByDay);
    const monthlyXP = buildMonthlyXPSeries(xpEvents);
    const globalRank = (await user_model_1.default.countDocuments({ xp: { $gt: totalXP } })) + 1;
    const persistedFields = {
        xp: totalXP,
        level,
        rank,
        streak,
        longestStreak,
        lastActiveAt,
        accuracy,
        globalRank,
        solved,
        totalSolved,
        badges,
    };
    const updatedUser = await user_model_1.default.findByIdAndUpdate(normalizedUserId, { $set: persistedFields }, { new: true }).lean();
    return {
        user: updatedUser,
        dashboard: {
            weeklyActivity,
            monthlyXP,
            achievements: badges,
            insightStats: {
                totalSolved,
                totalSubmissions,
                acceptedSubmissions,
                accuracy,
                completedResources,
                completedRoadmaps,
                certificatesEarned: certificates.length,
                communitiesJoined: memberships.length,
                communityPosts: posts.length,
                communityComments: comments.length,
                streak,
                longestStreak,
                activeDays: activeDayKeys.size,
            },
        },
    };
};
exports.syncUserGamification = syncUserGamification;
