"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CourseRouter = express_1.default.Router();
const course_controller_1 = require("./course.controller");
const course_upload_middleware_1 = require("../../utils/course_upload.middleware");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
/* ─── ROUTES ───────────────────────────────────────────── */
CourseRouter.post("/create", gaurd_middleware_1.AdminGuard, course_upload_middleware_1.uploadMultiple, course_controller_1.createCourse);
CourseRouter.get("/", course_controller_1.fetchCourses); // Get all courses
CourseRouter.get("/:id", course_controller_1.fetchCourse); // Get single course by ID
// Update course
CourseRouter.delete("/:id", course_controller_1.deleteCourse); // Delete course
exports.default = CourseRouter;
