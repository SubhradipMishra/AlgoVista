import { Router } from "express";
import { createSubmissionMultiple, getExecutorHealth, getProblemSubmissions, getUserSubmissions, getUserSubmissionsWithSpecificProblem, prewarmExecutor } from "./submission.controller";



const SubmissionRouter = Router();

SubmissionRouter.get("/health", getExecutorHealth);
SubmissionRouter.post("/prewarm", prewarmExecutor);

// Submit code for all test cases
SubmissionRouter.post("/", createSubmissionMultiple);

// Submission history
SubmissionRouter.get("/user/:userId", getUserSubmissions);
SubmissionRouter.get("/user/:userId/problem/:problemId", getUserSubmissionsWithSpecificProblem);
SubmissionRouter.get("/problem/:problemId", getProblemSubmissions);

export default SubmissionRouter;
