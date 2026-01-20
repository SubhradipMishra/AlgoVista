import express from "express";
const MentorDetailsRouter = express.Router();

import {
  createMentorDetails,
  getAllMentors,
  getMentorById,
  updateMentorDetails,
  deleteMentorDetails,
 
} from "./mentor-deatils.controller";
import { AdminGuard, SuperAdminGaurd } from "../middleware/gaurd.middleware";



// ---------------------- Routes ----------------------

// Only admin or super-admin can create mentor details
MentorDetailsRouter.post("/", SuperAdminGaurd, createMentorDetails);

// Anyone can view all mentors
MentorDetailsRouter.get("/", getAllMentors);

// Anyone can view single mentor
MentorDetailsRouter.get("/:id", getMentorById);

// Only admin can update mentor details
MentorDetailsRouter.put("/:id", SuperAdminGaurd, updateMentorDetails);

// Only super-admin can delete mentor details
MentorDetailsRouter.delete("/:id", SuperAdminGaurd, deleteMentorDetails);



export default MentorDetailsRouter;
