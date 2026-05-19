"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// ✅ Load environment variables first
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const features_model_1 = require("./mentorship/features.model");
// ✅ Import all routes
const user_routes_1 = __importDefault(require("./user/user.routes"));
const roadmap_routes_1 = __importDefault(require("./roadmap/roadmap.routes"));
const tags_routes_1 = __importDefault(require("./tags/tags.routes"));
const roadmap_progress_routes_1 = __importDefault(require("./roadmap-progress/roadmap-progress.routes"));
const topics_routes_1 = __importDefault(require("./topics/topics.routes"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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
            if (!mentorshipId || !senderId || !senderRole || !text)
                return;
            const newMessage = new features_model_1.MentorshipMessageModel({
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
                        const mentorMessage = new features_model_1.MentorshipMessageModel({
                            mentorshipId,
                            senderId: "mentor_sim",
                            senderRole: "mentor",
                            text: randomReply,
                        });
                        await mentorMessage.save();
                        io.to(mentorshipId).emit("receive_message", mentorMessage);
                    }
                    catch (e) {
                        console.error("Simulated reply error:", e);
                    }
                }, 1500);
            }
        }
        catch (err) {
            console.error("Socket message error:", err);
        }
    });
    socket.on("disconnect", () => {
        console.log("🔌 User disconnected from Socket:", socket.id);
    });
});
// ==========================================
// ⚙️ Express Middlewares & Configurations
// ==========================================
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));
app.use("/payment/webhook", express_1.default.raw({ type: "application/json" }));
// Enable body parser and cookies
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/uploads/courses", express_1.default.static(path_1.default.join(__dirname, "../uploads/courses")));
mongoose_1.default
    .connect(process.env.DB_URL)
    .then(() => console.log("✅ Database connected successfully"))
    .catch((err) => console.error("❌ Failed to connect database:", err));
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
// ================================
// 🚏 API Routes
// ================================
app.use("/auth", user_routes_1.default);
app.use("/roadmap", roadmap_routes_1.default);
app.use("/tags", tags_routes_1.default);
app.use("/progress", roadmap_progress_routes_1.default);
app.use("/topics", topics_routes_1.default);
const success_story_routes_1 = __importDefault(require("./success-story/success-story.routes"));
app.use('/success-story', success_story_routes_1.default);
const mentor_manager_routes_1 = __importDefault(require("./mentor-manager/mentor-manager.routes"));
app.use('/mentor-manager', mentor_manager_routes_1.default);
const skills_routes_1 = __importDefault(require("./skills/skills.routes"));
app.use('/skills', skills_routes_1.default);
const activity_routes_1 = __importDefault(require("./activity/activity.routes"));
app.use('/activity', activity_routes_1.default);
const certificate_routes_1 = __importDefault(require("./certificate/certificate.routes"));
app.use('/certificate', certificate_routes_1.default);
const problem_route_1 = __importDefault(require("./problem/problem.route"));
app.use("/problem", problem_route_1.default);
const submission_route_1 = __importDefault(require("./submission/submission.route"));
app.use("/submissions", submission_route_1.default);
const course_routes_1 = __importDefault(require("./course/course.routes"));
app.use('/course', course_routes_1.default);
const course_enrollment_routes_1 = __importDefault(require("./course-enrollment/course-enrollment.routes"));
app.use('/course-enrollment', course_enrollment_routes_1.default);
const payment_routes_1 = __importDefault(require("./payment/payment.routes"));
app.use('/payment', payment_routes_1.default);
const order_routes_1 = __importDefault(require("./order/order.routes"));
app.use('/order', order_routes_1.default);
const mentor_deatils_routes_1 = __importDefault(require("./mentor-deatils/mentor-deatils.routes"));
app.use('/mentor-details', mentor_deatils_routes_1.default);
const mentorship_routes_1 = __importDefault(require("./mentorship/mentorship.routes"));
app.use('/mentorship', mentorship_routes_1.default);
