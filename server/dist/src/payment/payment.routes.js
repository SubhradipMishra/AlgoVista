"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const payment_controller_1 = require("./payment.controller");
const PaymentRouter = express_1.default.Router();
// Create Order (User authenticated)
PaymentRouter.post("/course/order", gaurd_middleware_1.UserGuard, payment_controller_1.generateOrderCourse);
PaymentRouter.post("/mentorship/order", gaurd_middleware_1.UserGuard, payment_controller_1.generateOrderMentor);
PaymentRouter.post("/webhook", gaurd_middleware_1.RazorpayGaurd, payment_controller_1.webhook);
exports.default = PaymentRouter;
