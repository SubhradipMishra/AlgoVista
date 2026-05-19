"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SkillsRouter = express_1.default.Router();
const skills_controller_1 = require("./skills.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
SkillsRouter.get('/', skills_controller_1.fetchSkills);
SkillsRouter.post("/", gaurd_middleware_1.AdminGuard, skills_controller_1.createSkills);
SkillsRouter.delete("/:id", gaurd_middleware_1.AdminGuard, skills_controller_1.deleteSkills);
exports.default = SkillsRouter;
