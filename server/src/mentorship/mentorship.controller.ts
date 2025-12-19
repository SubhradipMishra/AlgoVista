import { Request, Response } from "express";
import MentorshipModel from "./mentorship.model";
import MentorDetailsModel from "../mentor-deatils/mentor-deatils.model";

/**
 * CREATE / ENROLL mentee into mentorship
 */
export const createMentorship = async (req: Request, res: Response) => {
  try {
    const { mentor, mentee, plan, paymentId } = req.body;

    if (!mentor || !mentee) {
      return res.status(400).json({ message: "mentor and mentee are required" });
    }

    // Check if already active mentorship exists
    const existing = await MentorshipModel.findOne({
      mentor,
      mentee,
      status: "active",
    });

    if (existing) {
      return res.status(400).json({ message: "Active mentorship already exists" });
    }

    // Check mentor capacity
    const mentorDetails = await MentorDetailsModel.findOne({ mentorId: mentor });
    if (!mentorDetails || !mentorDetails.maximumNoOfMentees) {
      return res.status(400).json({ message: "Mentor has no available capacity" });
    }

    const mentorship = await MentorshipModel.create({
      mentor,
      mentee,
      plan,
      paymentId,
    });

    // Update mentor details
    mentorDetails.mentees.push(mentee);
    mentorDetails.noOfMentees += 1;
    await mentorDetails.save();

    res.status(201).json({
      message: "Mentorship created successfully",
      data: mentorship,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET all mentorships (admin)
 */
export const getAllMentorships = async (_: Request, res: Response) => {
  try {
    const mentorships = await MentorshipModel.find()
      .populate("mentor", "fullname email")
      .populate("mentee", "fullname email");

    res.json(mentorships);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET mentorship by ID
 */
export const getMentorshipById = async (req: Request, res: Response) => {
  try {
    const mentorship = await MentorshipModel.findById(req.params.id)
      .populate("mentor", "fullname email")
      .populate("mentee", "fullname email");

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    res.json(mentorship);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET all mentorships of a mentor
 */
export const getMentorshipsByMentor = async (req: Request, res: Response) => {
  try {
    const mentorships = await MentorshipModel.find({
      mentor: req.params.mentorId,
    }).populate("mentee", "fullname email");

    res.json(mentorships);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET all mentorships of a mentee
 */
export const getMentorshipsByMentee = async (req: Request, res: Response) => {
  try {
    const mentorships = await MentorshipModel.find({
      mentee: req.params.menteeId,
    }).populate("mentor", "fullname email");

    res.json(mentorships);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE mentorship status (pause / resume / complete / terminate)
 */
export const updateMentorshipStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const mentorship = await MentorshipModel.findById(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    mentorship.status = status;

    if (status === "completed" || status === "terminated") {
      mentorship.endDate = new Date();

      // Remove mentee from mentor active list
      const mentorDetails = await MentorDetailsModel.findOne({
        mentorId: mentorship.mentor,
      });

      if (mentorDetails) {
        mentorDetails.mentees = mentorDetails.mentees.filter(
          (m) => m.toString() !== mentorship.mentee.toString()
        );
        mentorDetails.noOfMentees -= 1;
        await mentorDetails.save();
      }
    }

    await mentorship.save();

    res.json({
      message: "Mentorship status updated",
      data: mentorship,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE mentorship (admin only)
 */
export const deleteMentorship = async (req: Request, res: Response) => {
  try {
    const mentorship = await MentorshipModel.findByIdAndDelete(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    res.json({ message: "Mentorship deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
