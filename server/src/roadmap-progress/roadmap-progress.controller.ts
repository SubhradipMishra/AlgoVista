import { Request, Response } from "express";
import mongoose from "mongoose";
import RoadmapModel from "../roadmap/roadmap.model";
import RoadmapProgressModel from "./roadmap-progress.model";

interface ResourceUpdateBody {
  userId: string;
  roadmapId: string;
  subtopicName: string;
  resourceTitle: string;
  completed?: boolean;
}

interface SaveProgressBody {
  userId: string;
  roadmapId: string;
  subtopics: Array<{
    subtopicName: string;
    resources: Array<{ title: string; completed: boolean }>;
  }>;
}

// ==========================================================
// Save or Update Full Progress
// ==========================================================
export const saveProgress = async (
  req: Request<{}, {}, SaveProgressBody>,
  res: Response
) => {
  try {
    const { userId, roadmapId, subtopics } = req.body;

    if (!userId || !roadmapId || !Array.isArray(subtopics)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    let totalResources = 0;
    let totalCompleted = 0;

    subtopics.forEach((sub) => {
      const completedCount = sub.resources.filter((r) => r.completed).length;
      const total = sub.resources.length;

      (sub as any).completedCount = completedCount;
      (sub as any).totalResources = total;
      (sub as any).progressPercent = total ? (completedCount / total) * 100 : 0;

      totalResources += total;
      totalCompleted += completedCount;
    });

    const overallProgress =
      totalResources > 0 ? (totalCompleted / totalResources) * 100 : 0;

    const progress = await RoadmapProgressModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), roadmapId: new mongoose.Types.ObjectId(roadmapId) },
      { subtopics, overallProgress, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, progress });
  } catch (err) {
    console.error("❌ Error saving progress:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==========================================================
// Get User's Progress for a Roadmap
// ==========================================================
export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId, roadmapId } = req.params;

    console.log("📡 getProgress request:", { userId, roadmapId });

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roadmapId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or roadmapId",
      });
    }

    const progress = await RoadmapProgressModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      roadmapId: new mongoose.Types.ObjectId(roadmapId),
    });

    return res.status(200).json({ success: true, progress: progress || null });
  } catch (err) {
    console.error("❌ Error fetching progress:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==========================================================
// Update a Single Resource Progress
// ==========================================================
export const updateResourceProgress = async (
  req: Request<{}, {}, ResourceUpdateBody>,
  res: Response
) => {
  try {
    const { userId, roadmapId, subtopicName, resourceTitle, completed } = req.body;

    console.log("📡 updateResourceProgress body:", req.body);

    if (!userId || !roadmapId || !subtopicName || !resourceTitle) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let progress = await RoadmapProgressModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      roadmapId: new mongoose.Types.ObjectId(roadmapId),
    });

    // If no progress found → initialize
    if (!progress) {
      const roadmap = await RoadmapModel.findById(roadmapId);
      if (!roadmap)
        return res.status(404).json({ success: false, message: "Roadmap not found" });

      const subtopics = roadmap.subtopics.map((sub: any) => ({
        subtopicName: sub.name,
        resources: sub.resources.map((r: any) => ({
          title: r.title,
          completed: false,
        })),
        completedCount: 0,
        totalResources: sub.resources.length,
        progressPercent: 0,
      }));

      progress = new RoadmapProgressModel({
        userId: new mongoose.Types.ObjectId(userId),
        roadmapId: new mongoose.Types.ObjectId(roadmapId),
        subtopics,
      });
    }

    const subtopic = progress.subtopics.find((s: any) => s.subtopicName === subtopicName);
    if (!subtopic)
      return res.status(404).json({ success: false, message: "Subtopic not found" });

    const resource = subtopic.resources.find((r: any) => r.title === resourceTitle);
    if (!resource)
      return res.status(404).json({ success: false, message: "Resource not found" });

    // ✅ Toggle completion
    resource.completed = completed ?? !resource.completed;
    resource.completedAt = resource.completed ? new Date() : null;

    // Update progress values
    subtopic.completedCount = subtopic.resources.filter((r: any) => r.completed).length;
    subtopic.progressPercent = (subtopic.completedCount / subtopic.resources.length) * 100;

    const totalCompleted = progress.subtopics.reduce(
      (acc: number, s: any) => acc + s.completedCount,
      0
    );
    const totalResources = progress.subtopics.reduce(
      (acc: number, s: any) => acc + s.totalResources,
      0
    );

    progress.overallProgress =
      totalResources > 0 ? (totalCompleted / totalResources) * 100 : 0;
    progress.updatedAt = new Date();

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress,
    });
  } catch (err) {
    console.error("❌ Error updating progress:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
