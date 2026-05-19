"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MentorDetailsRouter = express_1.default.Router();
const mentor_deatils_controller_1 = require("./mentor-deatils.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
// ---------------------- Routes ----------------------
// Only admin or super-admin can create mentor details
MentorDetailsRouter.post("/", gaurd_middleware_1.SuperAdminGaurd, mentor_deatils_controller_1.createMentorDetails);
// Anyone can view all mentors
MentorDetailsRouter.get("/", mentor_deatils_controller_1.getAllMentors);
// Anyone can view single mentor
MentorDetailsRouter.get("/:id", mentor_deatils_controller_1.getMentorById);
// Only admin can update mentor details
MentorDetailsRouter.put("/:id", gaurd_middleware_1.SuperAdminGaurd, mentor_deatils_controller_1.updateMentorDetails);
// Only super-admin can delete mentor details
MentorDetailsRouter.delete("/:id", gaurd_middleware_1.SuperAdminGaurd, mentor_deatils_controller_1.deleteMentorDetails);
exports.default = MentorDetailsRouter;
