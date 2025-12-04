import { Request, Response } from "express";
import CourseEnrollmentModel from "./course-enrollment.model";

// =========================
// Create Enrollment
// =========================
export const createEnrollment = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    // Check if user already enrolled
    const existing = await CourseEnrollmentModel.findOne({ userId, courseId });
    if (existing) {
      return res.status(200).json({
        message: "Already enrolled",
        enrolled: true,
        enrollment: existing,
      });
    }


    const enrollment = await CourseEnrollmentModel.create({
      userId,
      courseId,
      enrolledAt: Date.now(), 
    });

    return res.status(201).json({
      message: "Enrollment successful",
      enrolled: true,
      enrollment,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err?.message || "Server error" });
  }
};



export const fetchEnrolledCourse = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const courses = await CourseEnrollmentModel
      .find({ userId })
      .lean();

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err?.message || "Server error" });
  }
};




export const fetchAllEnrolledUsers = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const users = await CourseEnrollmentModel
      .find({ courseId })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err?.message || "Server error" });
  }
};
