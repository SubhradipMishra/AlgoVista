import { Router } from "express";
import {
  changePassword,
  fetchMentor,
  fetchMentorById,
  fetchMentorBySuperAdmin,
  fetchUserById,
  login,
  logout,
  refreshToken,
  session,
  signup,
  updateUser,
} from "./user.controller";

import {
  AdminGuard,
  AdminUserGuard,
  AdminUserSuperAdminGuard,
  RefreshTokenGaurd,
  SuperAdminGaurd,
  UserGuard,
} from "../middleware/gaurd.middleware";

const UserRouter = Router();

// -------------------- AUTH --------------------
UserRouter.post("/signup", signup);
UserRouter.post("/login", login);
UserRouter.post("/logout", logout);
UserRouter.get("/refresh-token", RefreshTokenGaurd, refreshToken);
UserRouter.get("/session", AdminUserSuperAdminGuard, session);
UserRouter.get("/user/:id",UserGuard ,fetchUserById);

// -------------------- PASSWORD --------------------
UserRouter.put("/change-password", AdminUserGuard, changePassword);

// -------------------- USER MANAGEMENT --------------------
UserRouter.put("/update/:id", AdminUserGuard, updateUser);

// -------------------- MENTORS --------------------
UserRouter.get("/mentors", fetchMentor);
UserRouter.get("/mentors/:id", fetchMentorById);
UserRouter.get("/mentorsBySuperMentors", SuperAdminGaurd, fetchMentorBySuperAdmin);


export default UserRouter;
