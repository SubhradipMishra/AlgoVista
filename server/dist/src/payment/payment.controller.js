"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderMentor = exports.webhook = exports.generateOrderCourse = void 0;
const course_model_1 = __importDefault(require("../course/course.model"));
const razorpay_1 = __importDefault(require("razorpay"));
const mongoose_1 = require("mongoose");
const mentorship_model_1 = __importDefault(require("../mentorship/mentorship.model"));
const order_controller_1 = require("../order/order.controller");
const mentor_deatils_model_1 = __importDefault(require("../mentor-deatils/mentor-deatils.model"));
const mentorship_controller_1 = require("../mentorship/mentorship.controller");
const getInstance = () => {
    return new razorpay_1.default({
        key_id: process.env.RZP_KEY || "rzp_test_SbMCXavd2ljutr",
        key_secret: process.env.RZP_SECRET || "usn6oNqkOxcmjocD4uVGes9n",
    });
};
const generateOrderCourse = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log(productId);
        const product = await course_model_1.default.findById(productId);
        if (!product)
            return res.status(400).json({ message: "Bad Request!" });
        const price = product.discountPrice;
        const order = await getInstance().orders.create({
            amount: price * 100,
            currency: "INR",
            receipt: `AlgoVista_${Date.now()}`,
        });
        console.log(order);
        return res.json(order);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
};
exports.generateOrderCourse = generateOrderCourse;
const payementSuccess = async (req) => {
    const rawBody = req.body.toString();
    const data = JSON.parse(rawBody);
    const payment = data.payload.payment.entity;
    const notes = payment.notes;
    return (0, order_controller_1.createOrder)({
        user: notes.user,
        product: notes.product,
        paymentId: payment.id,
        discount: Number(notes.discount)
    });
};
const paymentFailed = async () => {
    console.log("failed!");
};
const calculateEndingDate = (start, duration) => {
    const end = new Date(start);
    end.setDate(end.getDate() + duration); // DAYS
    return end;
};
const mentorEnrollment = async (req) => {
    const rawBody = req.body.toString();
    const data = JSON.parse(rawBody);
    const payment = data.payload.payment.entity;
    const notes = payment.notes;
    /* ---------- Idempotency check (VERY IMPORTANT) ---------- */
    const existing = await mentorship_model_1.default.findOne({
        paymentId: payment.id,
    });
    if (existing)
        return existing;
    /* ---------- Fetch mentor & plan ---------- */
    const mentor = await mentor_deatils_model_1.default.findOne({
        mentorId: new mongoose_1.Types.ObjectId(notes.mentor),
        "plans._id": new mongoose_1.Types.ObjectId(notes.product),
    }, {
        plans: { $elemMatch: { _id: new mongoose_1.Types.ObjectId(notes.product) } },
    });
    if (!mentor || !mentor.plans?.length) {
        throw new Error("Mentorship plan not found");
    }
    const plan = mentor.plans[0];
    /* ---------- Dates ---------- */
    const startingDate = new Date();
    const endingDate = calculateEndingDate(startingDate, plan.duration);
    /* ---------- Create mentorship ---------- */
    const mentorship = await (0, mentorship_controller_1.createMentorship)({
        user: notes.user,
        mentor: notes.mentor,
        planId: plan._id,
        startingDate,
        endingDate,
        paymentId: payment.id,
        planSnapshot: {
            title: plan.title,
            price: plan.price,
            duration: plan.duration,
        },
    });
    /* ---------- Increment mentor seat count ---------- */
    const result = await mentor_deatils_model_1.default.updateOne({
        mentorId: new mongoose_1.Types.ObjectId(notes.mentor),
        $expr: { $lt: ["$noOfMentees", "$maximumNoOfMentees"] },
    }, {
        $inc: { noOfMentees: 1 },
    });
    if (result.modifiedCount === 0) {
        throw new Error("Mentor seat limit reached");
    }
    return mentorship;
};
const webhook = async (req, res) => {
    try {
        const rawBody = req.body.toString();
        const payload = JSON.parse(rawBody);
        if (payload.event === "payment.captured") {
            if (payload.payload.payment.entity.notes.mentor) {
                await mentorEnrollment(req);
            }
            else {
                await payementSuccess(req);
            }
        }
        if (payload.event === "payment.failed") {
            await paymentFailed();
        }
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Webhook error" });
    }
};
exports.webhook = webhook;
const generateOrderMentor = async (req, res) => {
    try {
        const { productId, mentorId, userId } = req.body;
        /* ---------- Validation ---------- */
        if (!productId || !mentorId) {
            return res.status(400).json({
                success: false,
                message: "productId and mentorId are required",
            });
        }
        if (!mongoose_1.Types.ObjectId.isValid(productId) || !mongoose_1.Types.ObjectId.isValid(mentorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid productId or mentorId",
            });
        }
        /* ---------- Fetch matching plan only ---------- */
        const mentor = await mentor_deatils_model_1.default.findOne({
            mentorId: new mongoose_1.Types.ObjectId(mentorId),
            "plans._id": new mongoose_1.Types.ObjectId(productId),
        }, {
            plans: { $elemMatch: { _id: new mongoose_1.Types.ObjectId(productId) } },
        });
        if (!mentor || !mentor.plans || mentor.plans.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Mentorship plan not found",
            });
        }
        const selectedPlan = mentor.plans[0];
        /* ---------- Create Razorpay Order ---------- */
        const order = await getInstance().orders.create({
            amount: selectedPlan.price * 100,
            currency: "INR",
            receipt: `AlgoVista_${Date.now()}`,
            notes: {
                user: req.user.id || req.user._id || userId, // 👈 REQUIRED
                mentor: mentorId, // 👈 REQUIRED
                product: productId, // 👈 REQUIRED
            },
        });
        return res.status(200).json({
            success: true,
            order,
        });
    }
    catch (error) {
        console.error("Generate mentorship order error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating order",
        });
    }
};
exports.generateOrderMentor = generateOrderMentor;
