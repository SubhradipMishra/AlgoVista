import express from "express";
import bodyParser from "body-parser";

import { RazorpayGaurd, UserGuard } from "../middleware/gaurd.middleware";
import {  generateOrderCourse, generateOrderMentor, webhook } from "./payment.controller";


const PaymentRouter = express.Router();

// Create Order (User authenticated)
PaymentRouter.post("/course/order", UserGuard, generateOrderCourse);
PaymentRouter.post("/mentorship/order",UserGuard,generateOrderMentor) ;
PaymentRouter.post("/webhook",RazorpayGaurd,webhook);
export default PaymentRouter;
