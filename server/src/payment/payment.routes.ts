import express from "express";
import bodyParser from "body-parser";

import { RazorpayGaurd, UserGuard } from "../middleware/gaurd.middleware";
import { generateOrder, webhook } from "./payment.controller";


const PaymentRouter = express.Router();

// Create Order (User authenticated)
PaymentRouter.post("/order", UserGuard, generateOrder);

PaymentRouter.post("/webhook",RazorpayGaurd,webhook);
export default PaymentRouter;
