"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roadmap_progress_controller_1 = require("./roadmap-progress.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const ProgressRouter = express_1.default.Router();
// 📍 Save or update full roadmap progress
ProgressRouter.post("/save", gaurd_middleware_1.AdminUserGuard, roadmap_progress_controller_1.saveProgress);
// 📍 Get progress for a specific user and roadmap
ProgressRouter.get("/:userId/:roadmapId", gaurd_middleware_1.AdminUserGuard, roadmap_progress_controller_1.getProgress);
// 📍 Update a single resource progress
ProgressRouter.put("/update", gaurd_middleware_1.AdminUserGuard, roadmap_progress_controller_1.updateResourceProgress);
exports.default = ProgressRouter;
