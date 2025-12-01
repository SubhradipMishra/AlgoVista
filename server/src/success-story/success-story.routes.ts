import express from "express";
import {
  createSuccessStory,
  deleteSuccessStory,
  fetchSuccessStory,
  updateSuccessStory,
  fetchSuccessStoriesByMentorEmail,
} from "./success-story.controller";
import { AdminGuard } from "../middleware/gaurd.middleware";

const SuccessStoryRouter = express.Router();

// Public routes
SuccessStoryRouter.get("/", fetchSuccessStory);
SuccessStoryRouter.get("/mentorCreation",AdminGuard , fetchSuccessStoriesByMentorEmail);

// Admin routes (protected)
SuccessStoryRouter.post("/", AdminGuard, createSuccessStory);
SuccessStoryRouter.delete("/:id", AdminGuard, deleteSuccessStory);
SuccessStoryRouter.put("/:id", AdminGuard, updateSuccessStory);

export default SuccessStoryRouter;
