"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.fetchOrder = void 0;
// @ts-nocheck
const order_model_1 = __importDefault(require("./order.model"));
const fetchOrder = async (req, res) => {
    try {
        const orders = await order_model_1.default.find();
        return res.json(orders);
    }
    catch (err) {
        return res.status(200).json({ message: "Failed to fetch orders" });
    }
};
exports.fetchOrder = fetchOrder;
// helper function for webhook
const createOrder = async (data) => {
    try {
        const order = new order_model_1.default(data);
        await order.save();
        return order;
    }
    catch (err) {
        return err;
    }
};
exports.createOrder = createOrder;
