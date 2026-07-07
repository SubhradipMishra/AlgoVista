"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    }
}, { timestamps: true });
const TagsModel = (0, mongoose_1.model)('Tags', schema);
exports.default = TagsModel;
