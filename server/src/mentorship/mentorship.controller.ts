// @ts-nocheck
import { Request, Response } from "express";
import MentorShipInterface from "./mentorship.interface";
import MentorshipModel from "./mentorship.model";

/**
 * 🧹 Background sweeping scheduler (Runs every 10 seconds)
 * Satisfies the requirement to automatically expire membership plans on-time.
 */
setInterval(async () => {
  try {
    const now = new Date();
    const result = await MentorshipModel.updateMany(
      { status: "active", endingDate: { $lt: now } },
      { $set: { status: "expired" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Auto-Expiration] Automatically expired ${result.modifiedCount} mentorship program subscriptions.`);
    }
  } catch (err) {
    console.error("[Auto-Expiration] Error in background expiration sweeper:", err);
  }
}, 10000);

/**
 * GET /mentorship
 * Query params:
 *  - userId
 *  - mentorId
 *  - status (optional)
 * 
 * Performs an on-demand check and returns active/expired status.
 */
export const fetchMentorship = async (req: Request, res: Response) => {
  try {
    const { userId, mentorId, status } = req.query;

    // 1. Perform on-demand expiration check and update
    const now = new Date();
    await MentorshipModel.updateMany(
      { status: "active", endingDate: { $lt: now } },
      { $set: { status: "expired" } }
    );

    const filter: any = {};

    // 🔹 filter by user
    if (userId) {
      filter.user = userId;
    }

    // 🔹 filter by mentor
    if (mentorId) {
      filter.mentor = mentorId;
    }

    // 🔹 filter by status (active / expired / cancelled)
    if (status) {
      filter.status = status;
    }

    const mentorShips = await MentorshipModel.find(filter)
      .populate("user", "fullname email profileImage")
      .select("user mentor planId status startingDate endingDate planSnapshot")
      .sort({ createdAt: -1 });

    return res.status(200).json(mentorShips);
  } catch (err) {
    console.error("Fetch mentorship error:", err);
    return res.status(500).json({ message: "Failed to fetch mentorships" });
  }
};

/**
 * POST /mentorship (Create a new active mentorship contract manually or on callback)
 */
export const createMentorship = async (data: any) => {
  try {
    const newMentorship = new MentorshipModel(data);
    await newMentorship.save();
    return newMentorship;
  } catch (err) {
    console.error("Create mentorship database record error:", err);
  }
};
