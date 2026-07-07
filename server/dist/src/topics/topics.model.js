"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    title: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    }
}, { timestamps: true });
const TopicsModel = (0, mongoose_1.model)('Topics', schema);
exports.default = TopicsModel;
