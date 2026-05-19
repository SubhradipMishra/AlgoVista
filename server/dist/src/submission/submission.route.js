"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_1 = require("./submission.controller");
const SubmissionRouter = (0, express_1.Router)();
SubmissionRouter.get("/health", submission_controller_1.getExecutorHealth);
SubmissionRouter.post("/prewarm", submission_controller_1.prewarmExecutor);
// Submit code for all test cases
SubmissionRouter.post("/", submission_controller_1.createSubmissionMultiple);
// Submission history
SubmissionRouter.get("/user/:userId", submission_controller_1.getUserSubmissions);
SubmissionRouter.get("/user/:userId/problem/:problemId", submission_controller_1.getUserSubmissionsWithSpecificProblem);
SubmissionRouter.get("/problem/:problemId", submission_controller_1.getProblemSubmissions);
exports.default = SubmissionRouter;
