"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    }
}, { timestamps: true });
const SkillsModel = (0, mongoose_1.model)('Skills', schema);
exports.default = SkillsModel;
