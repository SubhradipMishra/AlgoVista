import MentorShipInterface from "./mentorship.interface";
import MentorshipModel from "./mentorship.model";
//controller

import { Request, Response } from "express";

/**
 * GET /mentorship
 * Query params:
 *  - userId
 *  - mentorId
 *  - status (optional)
 */
export const fetchMentorship = async (req: Request, res: Response) => {
  try {
    const { userId, mentorId, status } = req.query;

    const filter: any = {};

    // 🔹 filter by user
    if (userId) {
      filter.user = userId;
    }

    // 🔹 filter by mentor
    if (mentorId) {
      filter.mentor = mentorId;
    }

    // 🔹 filter by status (active / expired)
    if (status) {
      filter.status = status;
    }

    const mentorShips = await MentorshipModel.find(filter)
      .select("user mentor planId status startingDate endingDate")
      .sort({ createdAt: -1 });

    return res.status(200).json(mentorShips);
  } catch (err) {
    console.error("Fetch mentorship error:", err);
    return res.status(500).json({ message: "Failed to fetch mentorships" });
  }
};

export const createMentorship = async (data: any) => {
  try {
    const newMentorship = new MentorshipModel(data);
    await newMentorship.save();
    return newMentorship;
  }
  
  catch (err) {
    console.log(err);
  }
};
