import express from "express";
const CourseRouter = express.Router();

import {
  createCourse,
  fetchCourses,
  fetchCourse,
  updateCourse,
  deleteCourse,
} from "./course.controller";

import {uploadMultiple} from "../../utils/course_upload.middleware"

/* ─── ROUTES ───────────────────────────────────────────── */

CourseRouter.post("/create", uploadMultiple, createCourse);  // Create new course
CourseRouter.get("/", fetchCourses);                         // Get all courses
CourseRouter.get("/:id", fetchCourse);                       // Get single course by ID
CourseRouter.put("/:id", updateCourse);                      // Update course
CourseRouter.delete("/:id", deleteCourse);                   // Delete course

export default CourseRouter;
