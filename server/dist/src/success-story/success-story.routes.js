"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const success_story_controller_1 = require("./success-story.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const SuccessStoryRouter = express_1.default.Router();
// Public routes
SuccessStoryRouter.get("/", success_story_controller_1.fetchSuccessStory);
SuccessStoryRouter.get("/mentorCreation", gaurd_middleware_1.AdminGuard, success_story_controller_1.fetchSuccessStoriesByMentorEmail);
// Admin routes (protected)
SuccessStoryRouter.post("/", gaurd_middleware_1.AdminGuard, success_story_controller_1.createSuccessStory);
SuccessStoryRouter.delete("/:id", gaurd_middleware_1.AdminGuard, success_story_controller_1.deleteSuccessStory);
SuccessStoryRouter.put("/:id", gaurd_middleware_1.AdminGuard, success_story_controller_1.updateSuccessStory);
exports.default = SuccessStoryRouter;
