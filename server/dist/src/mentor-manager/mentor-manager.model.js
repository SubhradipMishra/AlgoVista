"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {}
}, { timestamps: true });
const MentorManagerModel = (0, mongoose_1.model)('MentorManager', schema);
exports.default = MentorManagerModel;
