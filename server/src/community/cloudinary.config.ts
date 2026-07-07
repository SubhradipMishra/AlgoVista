// @ts-nocheck
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.join(__dirname, "../../uploads/community");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({ storage });
