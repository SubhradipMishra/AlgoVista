// @ts-nocheck
import express from "express";
import bodyParser from "body-parser";

import { RazorpayGaurd, UserGuard } from "../middleware/gaurd.middleware";
import { generateOrderCourse, generateOrderMentor, generateOrderAlgoTuf, verifyAlgoTufPayment, webhook } from "./payment.controller";

const PaymentRouter = express.Router();

// Create Order (User authenticated)
PaymentRouter.post("/course/order", UserGuard, generateOrderCourse);
PaymentRouter.post("/mentorship/order", UserGuard, generateOrderMentor);
PaymentRouter.post("/algotuf/order", UserGuard, generateOrderAlgoTuf);
PaymentRouter.post("/algotuf/verify", UserGuard, verifyAlgoTufPayment);
PaymentRouter.post("/webhook", RazorpayGaurd, webhook);

export default PaymentRouter;
