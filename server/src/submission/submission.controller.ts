import ProblemModel from "../problem/problem.model";
import SubmissionModel from "./submission.model";
import { Request, Response } from "express";
import { checkDockerExecutorHealth, executeSubmissionInDocker, prewarmDockerImage } from "../executor/dockerRunner";

// Run code for all test cases
export const createSubmissionMultiple = async (req: Request, res: Response) => {
  try {
    const { language_id, source_code, problemId, userId } = req.body;

    const problem: any = await ProblemModel.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const results = await executeSubmissionInDocker({
      languageId: Number(language_id),
      sourceCode: source_code,
      testCases: problem.testCases || [],
    });

    const allPassed = results.every((result) => result.status === "Accepted");
    const firstNonAccepted = results.find((result) => result.status !== "Accepted");

    const verdict = allPassed ? "Accepted" : firstNonAccepted?.status || "Wrong Answer";
    const score = allPassed ? 100 : 0;

    const submission = await SubmissionModel.create({
      language_id,
      source_code,
      userId,
      problemId,
      results,
      verdict,
      score,
      finishedAt: new Date(),
    });

    return res.status(200).json({ submission });
  } catch (err: any) {
    const message = err?.message || "Submission failed";
    const statusCode = message.includes("Unsupported language_id") ? 400 : 500;
    return res.status(statusCode).json({ error: message });
  }
};

export const getExecutorHealth = async (_req: Request, res: Response) => {
  try {
    const health = await checkDockerExecutorHealth();
    return res.status(200).json(health);
  } catch (err: any) {
    return res.status(503).json({
      ok: false,
      error: err?.message || "Docker executor is unavailable",
    });
  }
};

export const prewarmExecutor = async (req: Request, res: Response) => {
  try {
    const languageId = Number(req.body?.language_id ?? req.query?.language_id);

    if (!languageId) {
      return res.status(400).json({ ok: false, error: "language_id is required" });
    }

    const result = await prewarmDockerImage(languageId);
    return res.status(200).json(result);
  } catch (err: any) {
    const message = err?.message || "Failed to prepare Docker executor";
    const statusCode = message.includes("Unsupported language_id") ? 400 : 503;
    return res.status(statusCode).json({ ok: false, error: message });
  }
};

// Get all submissions of a user
export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await SubmissionModel.find({
      userId: req.params.userId,
    })
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Submissions filtered by user + problem
export const getUserSubmissionsWithSpecificProblem = async (req: Request, res: Response) => {
  try {
    const { userId, problemId } = req.params as {
      userId?: string;
      problemId?: string;
    };

    const filter: Record<string, any> = {};
    if (userId) filter.userId = userId;
    if (problemId) filter.problemId = problemId;

    const submissions = await SubmissionModel.find(filter)
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get all submissions for a specific problem
export const getProblemSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await SubmissionModel.find({
      problemId: req.params.problemId,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
