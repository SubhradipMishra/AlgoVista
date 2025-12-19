import express from "express";
import {
  createMentorship,
  getAllMentorships,
  getMentorshipById,
  getMentorshipsByMentor,
  getMentorshipsByMentee,
  updateMentorshipStatus,
  deleteMentorship,
} from "./mentorship.controller";


import { AdminGuard } from "../middleware/gaurd.middleware";

const router = express.Router();


router.post("/", createMentorship);


router.get("/", AdminGuard, getAllMentorships);
router.get("/:id", getMentorshipById);
router.get("/mentor/:mentorId", getMentorshipsByMentor);
router.get("/mentee/:menteeId", getMentorshipsByMentee);


router.patch("/:id/status", updateMentorshipStatus);


router.delete("/:id", AdminGuard, deleteMentorship);

export default router;
