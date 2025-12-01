import express from "express";
import { createRoadmap,  deleteRoadmap,  getAllRoadmaps, getRoadmapById, updateRoadmap } from "./roadmap.controller";
import { AdminGuard } from "../middleware/gaurd.middleware";



const RoadmapRouter = express.Router();

// Admin routes
RoadmapRouter.post("/",AdminGuard, createRoadmap);
RoadmapRouter.put("/:id",AdminGuard, updateRoadmap);
RoadmapRouter.delete("/:id",deleteRoadmap);

// Public routes
RoadmapRouter.get("/", getAllRoadmaps);
RoadmapRouter.get("/:id", getRoadmapById);

export default RoadmapRouter;
