import { Request, Response } from "express";
import CourseModel from "./course.model";
import cloudinary from "../../utils/cloudinary";
import fs from "fs";

/* Upload Video to Cloudinary */
const uploadVideoToCloudinary = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "courses/videos",
    resource_type: "video",
  });

  fs.unlink(filePath, () => {}); // Delete temp file
  return result.secure_url;
};

export const createCourse = async (req: any, res: Response) => {
  try {
    const { title, description, difficultyLevel, duration, instructor, modules } =
      req.body;

    let parsedModules = modules ? JSON.parse(modules) : [];

    let thumbnail = null;
    let roadmapImage = null;

    for (const file of req.files as Express.Multer.File[]) {
      const { fieldname, path: filePath, filename } = file;

      if (fieldname === "thumbnail") {
        thumbnail = `http://localhost:4000/uploads/courses/${filename}`;
        continue;
      }

      if (fieldname === "roadmapImage") {
        roadmapImage = `http://localhost:4000/uploads/courses/${filename}`;
        continue;
      }

      // video_0_0 | pdf_1_2 format
      const [type, moduleIndex, subIndex] = fieldname.split("_");
      const target = parsedModules[moduleIndex]?.submodules[subIndex];
      if (!target) continue;

      if (type === "video") {
        target.videoUrl = await uploadVideoToCloudinary(filePath);``
      }
      if (type === "pdf") {
        target.pdfUrl = `http://localhost:4000/uploads/courses/${filename}`;
      }
    }

    const course = await CourseModel.create({
      title,
      description,
      difficultyLevel,
      duration,
      instructor,
      createdBy: req.user.id,
      thumbnail,
      roadmapImage,
      modules: parsedModules,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchCourses = async (_req: Request, res: Response) => {
  const courses = await CourseModel.find().sort({ createdAt: -1 });
  res.json({ success: true, courses });
};

export const fetchCourse = async (req: Request, res: Response) => {
  const course = await CourseModel.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  res.json({ success: true, course });
};

export const deleteCourse = async (req: Request, res: Response) => {
  const deleted = await CourseModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Course not found" });
  res.json({ success: true, message: "Course deleted successfully" });
};
