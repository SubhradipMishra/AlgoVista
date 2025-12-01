import axios from "axios";
import ProblemModel from "../problem/problem.model";
import SubmissionModel from "./submission.model";
import { Request, Response } from "express";

const JUDGE0_BASE = "https://ce.judge0.com".replace(/\/$/, "");
const judge0Headers = { "Content-Type": "application/json" };

// Run code for all test cases
export const createSubmissionMultiple = async (req: Request, res: Response) => {
  try {
    console.log("SUbmit", req.body);
    const { language_id, source_code, problemId, userId } = req.body;

    const problem: any = await ProblemModel.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const results: any[] = [];
    let allPassed = true;

    for (const tc of problem.testCases) {
      const payload = { language_id, source_code, stdin: tc.input };
      const { data } = await axios.post(
        `${JUDGE0_BASE}/submissions?wait=true`,
        payload,
        { headers: judge0Headers }
      );

      const output = data?.stdout ? data.stdout.trim() : "";
      const expected = tc.expectedOutput.trim();
      let status = "Accepted";

      if (data?.status?.description === "Compilation Error")
        status = "Compile Error";
      else if (data?.status?.description === "Time Limit Exceeded")
        status = "Time Limit";
      else if (data?.status?.description === "Runtime Error")
        status = "Runtime Error";
      else if (output !== expected) status = "Wrong Answer";

      if (status !== "Accepted") allPassed = false;

      results.push({
        input: tc.input,
        expected,
        output,
        status,
        time: data.time,
        memory: data.memory,
      });
    }

    const verdict = allPassed ? "Accepted" : "Wrong Answer";
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
  } catch (err) {
    return res.status(500).json({ error: "Submission failed" });
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
    console.log("userproblem", req.body);
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
