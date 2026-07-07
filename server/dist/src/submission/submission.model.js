"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const resultSchema = new mongoose_1.default.Schema({
    input: String,
    expected: String,
    output: String,
    status: String, // Accepted, Wrong Answer, Compile Error, Runtime Error, TLE
    time: String,
    memory: Number,
});
const submissionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    problemId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Problem" },
    language_id: { type: Number, required: true },
    source_code: { type: String, required: true },
    results: [resultSchema],
    verdict: String, // Overall verdict
    score: Number,
    createdAt: { type: Date, default: Date.now },
    finishedAt: Date,
}, { timestamps: true });
const SubmissionModel = (0, mongoose_1.model)("Submission", submissionSchema);
exports.default = SubmissionModel;
