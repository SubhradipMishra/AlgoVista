import express from "express";
const CourseRouter = express.Router();

import {
  createCourse,
  fetchCourses,
  fetchCourse,
  deleteCourse,
} from "./course.controller";

import {uploadMultiple} from "../../utils/course_upload.middleware"
import { AdminGuard } from "../middleware/gaurd.middleware";

/* ─── ROUTES ───────────────────────────────────────────── */

CourseRouter.post("/create", AdminGuard, uploadMultiple, createCourse);

CourseRouter.get("/", fetchCourses);                         // Get all courses
CourseRouter.get("/:id", fetchCourse);                       // Get single course by ID
                    // Update course
CourseRouter.delete("/:id", deleteCourse);                   // Delete course

export default CourseRouter;
