"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MentorManagerRouter = express_1.default.Router();
const mentor_manager_controller_1 = require("./mentor-manager.controller");
MentorManagerRouter.get('/', mentor_manager_controller_1.fetchMentorManager);
exports.default = MentorManagerRouter;
