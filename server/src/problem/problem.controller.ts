import { Request, Response } from "express";
import ProblemModel from "./problem.model";
// CREATE Problem
export const createProblem = async (req : Request, res : Response) => {
  try {
  
    const problem = await ProblemModel.create(req.body);
    res.status(201).json({ message: "Problem created", problem });
  } catch (err :any) {
    console.log("createProblem error =>", err);
    res.status(500).json({ error: "Failed to create problem" });
  }
};

// GET ALL Problems
export const getProblems = async (req:Request, res : Response) => {
  try {
    const problems = await ProblemModel.find().sort({ createdAt: -1 });
    console.log(problems);
    res.json({ problems });
  } catch (err:any) {
    res.status(500).json({ error: "Failed to fetch problems" });
  }
};

// GET Problem by ID
export const getProblemById = async (req:Request, res : Response) => {
  try {
    const problem = await ProblemModel.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json({ problem });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch problem" });
  }
};

// UPDATE Problem
export const updateProblem = async (req : Request, res :  Response) => {
  try {
    const updatedProblem = await ProblemModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProblem) return res.status(404).json({ error: "Problem not found" });
    res.json({ message: "Problem updated", problem: updatedProblem });
  } catch (err:any) {
    res.status(500).json({ error: "Failed to update problem" });
  }
};

// DELETE Problem
export const deleteProblem = async (req:Request, res:Response) => {
  try {
    const deleted = await ProblemModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Problem not found" });
    res.json({ message: "Problem deleted" });
  } catch (err:any) {
    res.status(500).json({ error: "Failed to delete problem" });
  }
};
