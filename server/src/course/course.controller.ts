import { Request, Response } from "express";
import CourseModel from "./course.model";

import cloudinary from "../../utils/cloudinary";
// Helper to upload file to Cloudinary
const uploadToCloudinary = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
    folder: "courses",
  });

  return result.secure_url;
};

/* ─── CREATE COURSE ───────────────────────────────────────────── */
export const createCourse = async (req: any, res: Response) => {
  try {
    const {
      title,
      description,
      difficultyLevel,
      duration,
      instructor,
      modules,
    } = req.body;

    console.log(req.body);

    let parsedModules = JSON.parse(modules);

    // Handle uploaded files & assign URLs in submodules
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const { fieldname, path } = file;
const [ , moduleIndex, subIndex, type ] = fieldname.split("_");

		console.log(moduleIndex , " "  ,  subIndex , " " , type);
        if (
          parsedModules[moduleIndex] &&
          parsedModules[moduleIndex].submodules[subIndex]
        ) {
          const cloudUrl = await uploadToCloudinary(path);

          if (type === "video") {
            parsedModules[moduleIndex].submodules[subIndex].videoUrl = cloudUrl;
          }

          if (type === "pdf") {
            parsedModules[moduleIndex].submodules[subIndex].pdfUrl = cloudUrl;
          }
        }
      }
    }

    const newCourse = await CourseModel.create({
      title,
      description,
      difficultyLevel,
      duration,
      instructor,
      createdBy:req.user.id,
      modules: parsedModules,
    });

	console.log(newCourse);

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── FETCH ALL COURSES ───────────────────────────────────────── */
export const fetchCourses = async (req: Request, res: Response) => {
  try {
    const courses = await CourseModel.find();

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── FETCH SINGLE COURSE ─────────────────────────────────────── */
export const fetchCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await CourseModel.findById(id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── UPDATE COURSE ───────────────────────────────────────────── */
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedCourse = await CourseModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.json({
      success: true,
      message: "Course updated successfully",
      updatedCourse,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── DELETE COURSE ───────────────────────────────────────────── */
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await CourseModel.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    return res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
