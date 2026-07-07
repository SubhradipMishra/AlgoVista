"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const TopicsRouter = express_1.default.Router();
const topics_controller_1 = require("./topics.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
TopicsRouter.get('/', gaurd_middleware_1.AdminGuard, topics_controller_1.fetchTopics);
TopicsRouter.post('/', gaurd_middleware_1.AdminGuard, topics_controller_1.createTopics);
TopicsRouter.delete("/:id", gaurd_middleware_1.AdminGuard, topics_controller_1.deleteTopics);
exports.default = TopicsRouter;
