"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ActivityRouter = express_1.default.Router();
const activity_controller_1 = require("./activity.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
ActivityRouter.get('/', activity_controller_1.fetchActivity);
ActivityRouter.get("/byId", gaurd_middleware_1.AdminUserGuard, activity_controller_1.fetchActivityByUser);
ActivityRouter.post("/", gaurd_middleware_1.AdminUserGuard, activity_controller_1.createActivity);
exports.default = ActivityRouter;
