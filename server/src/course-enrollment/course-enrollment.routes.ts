import express from 'express'
import { AdminGuard, UserGuard } from '../middleware/gaurd.middleware'
import { createEnrollment ,fetchAllEnrolledUsers,fetchEnrolledCourse} from './course-enrollment.controller'
const CourseEnrollmentRouter =  express.Router()


CourseEnrollmentRouter.post("/",UserGuard ,createEnrollment);
CourseEnrollmentRouter.get("/course",UserGuard , fetchEnrolledCourse);
CourseEnrollmentRouter.get("/user",AdminGuard , fetchAllEnrolledUsers);  

export default CourseEnrollmentRouter