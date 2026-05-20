"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MentorshipRouter = express_1.default.Router();
const mentorship_controller_1 = require("./mentorship.controller");
const features_controller_1 = require("./features.controller");
// Base routes
MentorshipRouter.get("/", mentorship_controller_1.fetchMentorship);
// Direct Chat Endpoints
MentorshipRouter.get("/:mentorshipId/messages", features_controller_1.getMessages);
MentorshipRouter.post("/:mentorshipId/messages", features_controller_1.sendMessage);
MentorshipRouter.delete("/messages/:messageId", features_controller_1.deleteMessage);
// 1-on-1 Sessions Endpoints
MentorshipRouter.get("/:mentorshipId/sessions", features_controller_1.getSessions);
MentorshipRouter.post("/:mentorshipId/sessions", features_controller_1.scheduleSession);
// Reviews & Submissions Endpoints
MentorshipRouter.get("/:mentorshipId/submissions", features_controller_1.getSubmissions);
MentorshipRouter.post("/:mentorshipId/submissions", features_controller_1.createSubmission);
MentorshipRouter.put("/submissions/:submissionId", features_controller_1.reviewSubmission);
// Learning Resources Endpoints
MentorshipRouter.get("/:mentorshipId/resources", features_controller_1.getResources);
MentorshipRouter.post("/:mentorshipId/resources", features_controller_1.addResource);
exports.default = MentorshipRouter;
