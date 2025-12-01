import { Request, Response } from "express";
import ActivityModel from "./activity.model";

/**
 * Fetch all activities (Admin only)
 */
export const fetchActivity = async (req: Request, res: Response) => {
  try {
    const activities = await ActivityModel.find().sort({ createdAt: -1 });
    return res.status(200).json(activities);
  } catch (err: any) {
    console.error("FetchActivity Error:", err);
    return res.status(500).json({ message: "Failed to fetch activities" });
  }
};

/**
 * Fetch user-specific activities
 */
export const fetchActivityByUser = async (req: any, res: Response) => {
  try {
    const activities = await ActivityModel.find({ userId: req.user.id }).sort({
      createdAt: -1,
    }).limit(5);
    return res.status(200).json(activities);
  } catch (err: any) {
    console.error("FetchActivityByUser Error:", err);
    return res.status(500).json({ message: "Failed to fetch user activities" });
  }
};

/**
 * Create an activity (roadmap view, quiz attempt, visualizer run, etc.)
 */
export const createActivity = async (req: Request, res: Response) => {
  try {
    console.log("Activity creation started...");
	console.log(req.body);
    const activity = new ActivityModel(req.body);
    await activity.save();
    return res.status(201).json({ message: "Activity successfully stored!" });
  } catch (err: any) {
    console.error("CreateActivity Error:", err);
    return res.status(500).json({ message: "Failed to create activity" });
  }
};
