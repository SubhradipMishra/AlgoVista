import { Router } from "express";
import { createSubmissionMultiple, getProblemSubmissions, getUserSubmissions, getUserSubmissionsWithSpecificProblem } from "./submission.controller";



const SubmissionRouter = Router();

// Submit code for all test cases
SubmissionRouter.post("/", createSubmissionMultiple);

// Submission history
SubmissionRouter.get("/user/:userId", getUserSubmissions);
SubmissionRouter.get("/user/:userId/problem/:problemId", getUserSubmissionsWithSpecificProblem);
SubmissionRouter.get("/problem/:problemId", getProblemSubmissions);

export default SubmissionRouter;
