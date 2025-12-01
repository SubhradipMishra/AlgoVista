import { Request, Response } from "express";
import RoadmapModel from "./roadmap.model";

/**
 * @desc Create a new roadmap module
 * @route POST /api/roadmap
 * @access Admin
 */
export const createRoadmap = async (req: any, res: Response) => {
  try {
    // Inject createdBy from logged-in user
    const roadmap = new RoadmapModel({
      ...req.body,
      createdBy: req.user._id, // <-- automatically injected
    });

    const savedRoadmap = await roadmap.save();

    res.status(201).json({
      success: true,
      message: "Roadmap module created successfully",
      data: savedRoadmap,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating roadmap module",
    });
  }
};


/**
 * @desc Get all roadmap modules (sorted by order)
 * @route GET /api/roadmap
 * @access Public
 */
export const getAllRoadmaps = async (req:Request, res:Response) => {
  try {
    const roadmaps = await RoadmapModel.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps,
    });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching roadmap data",
    });
  }
};

/**
 * @desc Get a single roadmap module by ID
 * @route GET /api/roadmap/:id
 * @access Public
 */
export const getRoadmapById = async (req:Request, res:Response) => {
  try {
    const roadmap = await RoadmapModel.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }
    res.status(200).json({ success: true, data: roadmap });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching roadmap module",
    });
  }
};

/**
 * @desc Update a roadmap module
 * @route PUT /api/roadmap/:id
 * @access Admin
 */
export const updateRoadmap = async (req:Request, res:Response) => {
  try {
    const updated = await RoadmapModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }
    res.status(200).json({
      success: true,
      message: "Roadmap module updated successfully",
      data: updated,
    });
  } catch (error:any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating roadmap module",
    });
  }
};

/**
 * @desc Delete a roadmap module
 * @route DELETE roadmap/:id
 * @access Admin
 */


export const deleteRoadmap = (req:Request , res:Response )=>{
  console.log("DELETE")
}
