"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({}, { timestamps: true });
const PaymentModel = (0, mongoose_1.model)('Payment', schema);
exports.default = PaymentModel;
