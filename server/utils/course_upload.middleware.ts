import multer from "multer";
import { randomUUID } from "crypto";  // Native replacement
import path from "path";
import fs from "fs";

const uploadFolder = path.join(__dirname, "../uploads/courses");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, randomUUID() + ext);  // Direct replacement for uuid()
  },
});

export const uploadMultiple = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB Max Upload
}).any();
