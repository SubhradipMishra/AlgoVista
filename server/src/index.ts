import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// ✅ Import all routes
import UserRouter from "./user/user.routes";
import RoadmapRouter from "./roadmap/roadmap.routes";
import TagsRouter from "./tags/tags.routes";
import ProgressRouter from "./roadmap-progress/roadmap-progress.routes";
import TopicsRouter from "./topics/topics.routes";

// ✅ Load environment variables
dotenv.config();

const app = express();

// ================================
// 🌐 Middleware Configuration
// ================================

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ fallback for safety
    credentials: true, // ✅ required for cookies/auth headers
  })
);

app.use("/payment/webhook", express.raw({ type: "application/json" }));

// Enable body parser and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads/courses", express.static(path.join(__dirname, "../uploads/courses")));


mongoose
  .connect(process.env.DB_URL as string)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Failed to connect database:", err));



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// ================================


// 🚏 API Routes
// ================================
app.use("/auth", UserRouter);
app.use("/roadmap", RoadmapRouter);
app.use("/tags", TagsRouter);
app.use("/progress", ProgressRouter);
app.use("/topics", TopicsRouter);
import SuccessStoryRouter from './success-story/success-story.routes'
app.use('/success-story', SuccessStoryRouter)  

import MentorManagerRouter from './mentor-manager/mentor-manager.routes'
app.use('/mentor-manager', MentorManagerRouter)

import SkillsRouter from './skills/skills.routes'
app.use('/skills', SkillsRouter)

import ActivityRouter from './activity/activity.routes'
app.use('/activity', ActivityRouter)

import CertificateRouter from './certificate/certificate.routes'
app.use('/certificate', CertificateRouter)

import ProblemRouter from "./problem/problem.route";
app.use("/problem",ProblemRouter);


import SubmissionRouter from "./submission/submission.route";
app.use("/submissions",SubmissionRouter)

import CourseRouter from './course/course.routes'

app.use('/course', CourseRouter)





import CourseEnrollmentRouter from './course-enrollment/course-enrollment.routes'
app.use('/course-enrollment', CourseEnrollmentRouter)

import PaymentRouter from './payment/payment.routes'
app.use('/payment', PaymentRouter)

import OrderRouter from './order/order.routes'
app.use('/order', OrderRouter)

import MentorDeatilsRouter from './mentor-deatils/mentor-deatils.routes'
app.use('/mentor-details', MentorDeatilsRouter)

import MentorshipRouter from './mentorship/mentorship.routes'
app.use('/mentorship', MentorshipRouter)