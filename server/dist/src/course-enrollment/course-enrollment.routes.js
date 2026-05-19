"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const course_enrollment_controller_1 = require("./course-enrollment.controller");
const CourseEnrollmentRouter = express_1.default.Router();
CourseEnrollmentRouter.post("/", gaurd_middleware_1.UserGuard, course_enrollment_controller_1.createEnrollment);
CourseEnrollmentRouter.get("/course", gaurd_middleware_1.UserGuard, course_enrollment_controller_1.fetchEnrolledCourse);
CourseEnrollmentRouter.get("/user", gaurd_middleware_1.AdminGuard, course_enrollment_controller_1.fetchAllEnrolledUsers);
exports.default = CourseEnrollmentRouter;
