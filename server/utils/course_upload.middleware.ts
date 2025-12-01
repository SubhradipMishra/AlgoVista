import multer from "multer";

const storage = multer.diskStorage({});

export const uploadSingle = multer({
  storage,
}).single("file");

export const uploadMultiple = multer({
  storage,
}).any(); // <= FIXED
