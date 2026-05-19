"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const OrderRouter = (0, express_1.Router)();
OrderRouter.get("/", order_controller_1.fetchOrder);
exports.default = OrderRouter;
