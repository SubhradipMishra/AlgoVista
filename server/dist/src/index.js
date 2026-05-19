"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
// ✅ Import all routes
const user_routes_1 = __importDefault(require("./user/user.routes"));
const roadmap_routes_1 = __importDefault(require("./roadmap/roadmap.routes"));
const tags_routes_1 = __importDefault(require("./tags/tags.routes"));
const roadmap_progress_routes_1 = __importDefault(require("./roadmap-progress/roadmap-progress.routes"));
const topics_routes_1 = __importDefault(require("./topics/topics.routes"));
// ✅ Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// ================================
// 🌐 Middleware Configuration
// ================================
// Enable CORS for frontend
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ fallback for safety
    credentials: true, // ✅ required for cookies/auth headers
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
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
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
