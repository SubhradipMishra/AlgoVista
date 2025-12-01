import express from "express";
import {
  getProgress,
  saveProgress,
  updateResourceProgress,
} from "./roadmap-progress.controller";
import { AdminUserGuard } from "../middleware/gaurd.middleware";

const ProgressRouter = express.Router();

// 📍 Save or update full roadmap progress
ProgressRouter.post("/save", AdminUserGuard, saveProgress);

// 📍 Get progress for a specific user and roadmap
ProgressRouter.get("/:userId/:roadmapId", AdminUserGuard, getProgress);

// 📍 Update a single resource progress
ProgressRouter.put("/update", AdminUserGuard, updateResourceProgress);

export default ProgressRouter;
