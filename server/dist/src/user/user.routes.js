"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const profile_upload_middleware_1 = __importDefault(require("../../utils/profile_upload.middleware"));
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const UserRouter = (0, express_1.Router)();
// -------------------- AUTH --------------------
UserRouter.post("/signup", user_controller_1.signup);
UserRouter.post("/login", user_controller_1.login);
UserRouter.post("/logout", user_controller_1.logout);
UserRouter.get("/refresh-token", gaurd_middleware_1.RefreshTokenGaurd, user_controller_1.refreshToken);
UserRouter.get("/session", gaurd_middleware_1.AdminUserSuperAdminGuard, user_controller_1.session);
UserRouter.get("/user/:id", gaurd_middleware_1.UserGuard, user_controller_1.fetchUserById);
// -------------------- PASSWORD --------------------
UserRouter.put("/change-password", gaurd_middleware_1.AdminUserGuard, user_controller_1.changePassword);
// -------------------- USER MANAGEMENT --------------------
UserRouter.put("/update/:id", gaurd_middleware_1.AdminUserGuard, user_controller_1.updateUser);
UserRouter.post("/upload-profile-image/:id", gaurd_middleware_1.AdminUserGuard, profile_upload_middleware_1.default.single("profileImage"), user_controller_1.uploadProfileImage);
// -------------------- MENTORS --------------------
UserRouter.get("/mentors", user_controller_1.fetchMentor);
UserRouter.get("/mentors/:id", user_controller_1.fetchMentorById);
UserRouter.get("/mentorsBySuperMentors", gaurd_middleware_1.SuperAdminGaurd, user_controller_1.fetchMentorBySuperAdmin);
exports.default = UserRouter;
