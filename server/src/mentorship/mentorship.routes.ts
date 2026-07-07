// @ts-nocheck
import express from "express";
const MentorshipRouter = express.Router();
import { fetchMentorship } from "./mentorship.controller";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  getSessions,
  scheduleSession,
  getSubmissions,
  createSubmission,
  reviewSubmission,
  getResources,
  addResource,
} from "./features.controller";

// Base routes
MentorshipRouter.get("/", fetchMentorship);

// Direct Chat Endpoints
MentorshipRouter.get("/:mentorshipId/messages", getMessages);
MentorshipRouter.post("/:mentorshipId/messages", sendMessage);
MentorshipRouter.delete("/messages/:messageId", deleteMessage);

// 1-on-1 Sessions Endpoints
MentorshipRouter.get("/:mentorshipId/sessions", getSessions);
MentorshipRouter.post("/:mentorshipId/sessions", scheduleSession);

// Reviews & Submissions Endpoints
MentorshipRouter.get("/:mentorshipId/submissions", getSubmissions);
MentorshipRouter.post("/:mentorshipId/submissions", createSubmission);
MentorshipRouter.put("/submissions/:submissionId", reviewSubmission);

// Learning Resources Endpoints
MentorshipRouter.get("/:mentorshipId/resources", getResources);
MentorshipRouter.post("/:mentorshipId/resources", addResource);

export default MentorshipRouter;