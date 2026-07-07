// @ts-nocheck
import express from "express";
import dotenv from "dotenv";
import path from "path";
// ✅ Load environment variables first
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { MentorshipMessageModel } from "./mentorship/features.model";

// ✅ Import all routes
import UserRouter from "./user/user.routes";
import RoadmapRouter from "./roadmap/roadmap.routes";
import TagsRouter from "./tags/tags.routes";
import ProgressRouter from "./roadmap-progress/roadmap-progress.routes";
import TopicsRouter from "./topics/topics.routes";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected to Socket:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`👤 User joined room: ${room}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { mentorshipId, senderId, senderRole, text } = data;
      if (!mentorshipId || !senderId || !senderRole || !text) return;

      const newMessage = new MentorshipMessageModel({
        mentorshipId,
        senderId,
        senderRole,
        text,
      });
      await newMessage.save();

      // Emit back to everyone in the room
      io.to(mentorshipId).emit("receive_message", newMessage);

      // Simulated real chatting reply from mentor
      if (senderRole === "user") {
        setTimeout(async () => {
          try {
            const replies = [
              "Awesome question! Let's schedule a call to deep dive into this.",
              "Nice progress. Focus on optimizing the database queries first.",
              "I highly suggest you check out the handbook resource we just shared.",
              "Looks perfect! Make sure you submit this for our next code review session.",
              "Let's meet tomorrow to review your resume updates.",
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            const mentorMessage = new MentorshipMessageModel({
              mentorshipId,
              senderId: "mentor_sim",
              senderRole: "mentor",
              text: randomReply,
            });
            await mentorMessage.save();
            io.to(mentorshipId).emit("receive_message", mentorMessage);
          } catch (e) {
            console.error("Simulated reply error:", e);
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Socket message error:", err);
    }
  });

  socket.on("delete_message", ({ room, messageId }) => {
    io.to(room).emit("message_deleted", { messageId });
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected from Socket:", socket.id);
  });
});

// ==========================================
// ⚙️ Express Middlewares & Configurations
// ==========================================
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use("/payment/webhook", express.raw({ type: "application/json" }));

// Enable body parser and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads/courses", express.static(path.join(__dirname, "../uploads/courses")));
app.use("/uploads/community", express.static(path.join(__dirname, "../uploads/community")));
app.use("/uploads/profiles", express.static(path.join(__dirname, "../uploads/profiles")));


mongoose
  .connect(process.env.DB_URL as string)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Failed to connect database:", err));



const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

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
app.use("/problem", ProblemRouter);


import SubmissionRouter from "./submission/submission.route";
app.use("/submissions", SubmissionRouter)

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

import CommunityRouter from "./community/community.routes";
app.use("/community", CommunityRouter);
