"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = void 0;
const multer_1 = __importDefault(require("multer"));
const crypto_1 = require("crypto"); // Native replacement
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadFolder = path_1.default.join(__dirname, "../uploads/courses");
if (!fs_1.default.existsSync(uploadFolder)) {
    fs_1.default.mkdirSync(uploadFolder, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadFolder),
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, (0, crypto_1.randomUUID)() + ext); // Direct replacement for uuid()
    },
});
exports.uploadMultiple = (0, multer_1.default)({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB Max Upload
}).any();
