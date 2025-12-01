import { Router } from "express";
import { createProblem, deleteProblem, getProblemById, getProblems, updateProblem } from "./problem.controller";


const ProblemRouter = Router();

ProblemRouter.post("/", createProblem);
ProblemRouter.get("/", getProblems);
ProblemRouter.get("/:id",getProblemById);
ProblemRouter.put("/:id", updateProblem);
ProblemRouter.delete("/:id", deleteProblem);

export default ProblemRouter;
