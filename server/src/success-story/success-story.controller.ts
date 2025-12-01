import { Request, Response } from "express";
import SuccessStoryModel from "./success-story.model";

// ✅ Fetch all success stories
export const fetchSuccessStory = async (req: Request, res: Response) => {
  try {
    const successStories = await SuccessStoryModel.find().sort({ createdAt: -1 });
    return res.status(200).json(successStories);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch success stories!" });
  }
};

// ✅ Fetch stories by mentor email
export const fetchSuccessStoriesByMentorEmail = async (req: any, res: Response) => {
  try {
  
    const mentorEmail  = req.user.email;

    if (!mentorEmail) {
      return res.status(400).json({ message: "Mentor email is required!" });
    }

    const stories = await SuccessStoryModel.find({ mentorEmail: mentorEmail.toLowerCase() }).sort({
      createdAt: -1,
    });

    if (!stories.length) {
      return res.status(404).json({ message: "No success stories found for this mentor!" });
    }

    return res.status(200).json({ count: stories.length, data: stories });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to fetch success stories for mentor!",
      error: err.message,
    });
  }
};

// ✅ Create new success story (Admin only)
export const createSuccessStory = async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    
    const newSuccessStory = new SuccessStoryModel(req.body);
    await newSuccessStory.save();

    return res.status(201).json({
      message: "Success story created successfully!",
      successStory: newSuccessStory,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create success story!", error: err.message });
  }
};

// ✅ Delete success story (Admin only)
export const deleteSuccessStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedStory = await SuccessStoryModel.findByIdAndDelete(id);

    if (!deletedStory) {
      return res.status(404).json({ message: "Success story not found!" });
    }

    return res.status(200).json({
      message: "Success story deleted successfully!",
      deletedStory,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to delete success story!",
      error: err.message,
    });
  }
};

// ✅ Update success story (Admin only)
export const updateSuccessStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedStory = await SuccessStoryModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStory) {
      return res.status(404).json({ message: "Success story not found!" });
    }

    return res.status(200).json({
      message: "Success story updated successfully!",
      updatedStory,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to update success story!",
      error: err.message,
    });
  }
};
