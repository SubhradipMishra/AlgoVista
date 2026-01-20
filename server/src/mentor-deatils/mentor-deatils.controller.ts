import { Request, Response } from "express";
import MentorDetailsModel from "./mentor-deatils.model";

// ---------------------- CREATE ----------------------
export const createMentorDetails = async (req: Request, res: Response) => {
  try {
    console.log("create mentor details hit");

    const {
      mentorId,
      noOfMentees,
      maximumNoOfMentees,
      features,
      specializations,
      bio,
      isAvailable,
      status,
      socialLinks,
      plans,
    } = req.body;

    if (!mentorId) {
      return res.status(400).json({ message: "mentorId is required" });
    }

    const existing = await MentorDetailsModel.findOne({ mentorId });
    if (existing) {
      return res.status(400).json({ message: "Mentor details already exist" });
    }

    const newMentor = new MentorDetailsModel({
      mentorId,
      noOfMentees: noOfMentees ?? 0,
      maximumNoOfMentees: maximumNoOfMentees ?? 10,
      features: features || [],
      specializations: specializations || [],
      bio: bio || "",
      isAvailable: isAvailable ?? true,
      status: status || "active",
      socialLinks: socialLinks || {},
      plans: plans || [],
    });

    await newMentor.save();

    res.status(201).json({
      message: "Mentor details created successfully",
      data: newMentor,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- READ ALL ----------------------
export const getAllMentors = async (req: Request, res: Response) => {
  try {
    console.log("HIT");
    const mentors = await MentorDetailsModel.find();
    res.status(200).json(mentors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- READ SINGLE ----------------------
export const getMentorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mentor = await MentorDetailsModel.findById(id)
      .populate("mentorId", "fullname email profileImage")
      .exec();

    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.status(200).json(mentor);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- UPDATE ----------------------
export const updateMentorDetails = async (req: Request, res: Response) => {
  try {
    console.log("update mentor details hit....");
    const { id } = req.params;
    const updates = req.body;

    const updated = await MentorDetailsModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    if (!updated) return res.status(404).json({ message: "Mentor not found" });

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- DELETE ----------------------
export const deleteMentorDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await MentorDetailsModel.findByIdAndDelete(id).exec();
    if (!deleted) return res.status(404).json({ message: "Mentor not found" });

    res.status(200).json({ message: "Mentor details deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
