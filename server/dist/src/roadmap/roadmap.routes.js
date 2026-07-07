"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const roadmap_controller_1 = require("./roadmap.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const RoadmapRouter = express_1.default.Router();
// Admin routes
RoadmapRouter.post("/", gaurd_middleware_1.AdminGuard, roadmap_controller_1.createRoadmap);
RoadmapRouter.put("/:id", gaurd_middleware_1.AdminGuard, roadmap_controller_1.updateRoadmap);
RoadmapRouter.delete("/:id", roadmap_controller_1.deleteRoadmap);
// Public routes
RoadmapRouter.get("/", roadmap_controller_1.getAllRoadmaps);
RoadmapRouter.get("/:id", roadmap_controller_1.getRoadmapById);
exports.default = RoadmapRouter;
