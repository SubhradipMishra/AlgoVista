"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProblem = exports.updateProblem = exports.getProblemById = exports.getProblems = exports.createProblem = void 0;
const problem_model_1 = __importDefault(require("./problem.model"));
// CREATE Problem
const createProblem = async (req, res) => {
    try {
        const problem = await problem_model_1.default.create(req.body);
        res.status(201).json({ message: "Problem created", problem });
    }
    catch (err) {
        console.log("createProblem error =>", err);
        res.status(500).json({ error: "Failed to create problem" });
    }
};
exports.createProblem = createProblem;
// GET ALL Problems
const getProblems = async (req, res) => {
    try {
        const problems = await problem_model_1.default.find().sort({ createdAt: -1 });
        console.log(problems);
        res.json({ problems });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch problems" });
    }
};
exports.getProblems = getProblems;
// GET Problem by ID
const getProblemById = async (req, res) => {
    try {
        const problem = await problem_model_1.default.findById(req.params.id);
        if (!problem)
            return res.status(404).json({ error: "Problem not found" });
        res.json({ problem });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch problem" });
    }
};
exports.getProblemById = getProblemById;
// UPDATE Problem
const updateProblem = async (req, res) => {
    try {
        const updatedProblem = await problem_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProblem)
            return res.status(404).json({ error: "Problem not found" });
        res.json({ message: "Problem updated", problem: updatedProblem });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update problem" });
    }
};
exports.updateProblem = updateProblem;
// DELETE Problem
const deleteProblem = async (req, res) => {
    try {
        const deleted = await problem_model_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ error: "Problem not found" });
        res.json({ message: "Problem deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete problem" });
    }
};
exports.deleteProblem = deleteProblem;
