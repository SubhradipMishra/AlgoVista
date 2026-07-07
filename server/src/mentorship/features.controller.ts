// @ts-nocheck
import { Request, Response } from "express";
import {
  MentorshipMessageModel,
  MentorshipSessionModel,
  MentorshipSubmissionModel,
  MentorshipResourceModel,
} from "./features.model";

// ==========================================
// 💬 Direct Chat Controller Functions
// ==========================================

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const messages = await MentorshipMessageModel.find({ mentorshipId }).sort({
      createdAt: 1,
    });
    return res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const { senderId, senderRole, text } = req.body;

    if (!text || !senderId || !senderRole) {
      return res.status(400).json({ message: "Missing message payload fields" });
    }

    const newMessage = new MentorshipMessageModel({
      mentorshipId,
      senderId,
      senderRole,
      text,
    });
    await newMessage.save();

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ message: "Failed to dispatch message" });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    await MentorshipMessageModel.findByIdAndDelete(messageId);
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete message error:", err);
    return res.status(500).json({ message: "Failed to delete message" });
  }
};

// ==========================================
// 📅 1-on-1 Sessions Controller Functions
// ==========================================

export const getSessions = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const sessions = await MentorshipSessionModel.find({ mentorshipId }).sort({
      date: 1,
    });
    return res.status(200).json(sessions);
  } catch (err) {
    console.error("Get sessions error:", err);
    return res.status(500).json({ message: "Failed to fetch scheduled calls" });
  }
};

export const scheduleSession = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const { date, time, topic } = req.body;

    if (!date || !time || !topic) {
      return res.status(400).json({ message: "Missing required call schedule parameters" });
    }

    const newSession = new MentorshipSessionModel({
      mentorshipId,
      date: new Date(date),
      time,
      topic,
    });
    await newSession.save();

    return res.status(201).json(newSession);
  } catch (err) {
    console.error("Schedule session error:", err);
    return res.status(500).json({ message: "Failed to schedule call" });
  }
};

// ==========================================
// 📂 Submissions Controller Functions
// ==========================================

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const submissions = await MentorshipSubmissionModel.find({ mentorshipId }).sort({
      createdAt: -1,
    });
    return res.status(200).json(submissions);
  } catch (err) {
    console.error("Get submissions error:", err);
    return res.status(500).json({ message: "Failed to load review items" });
  }
};

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const { type, title, link, notes } = req.body;

    if (!type || !title || !link) {
      return res.status(400).json({ message: "Missing required submission parameters" });
    }

    const newSubmission = new MentorshipSubmissionModel({
      mentorshipId,
      type,
      title,
      link,
      notes,
    });
    await newSubmission.save();

    return res.status(201).json(newSubmission);
  } catch (err) {
    console.error("Create submission error:", err);
    return res.status(500).json({ message: "Failed to register submission" });
  }
};

export const reviewSubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;

    if (!status || !feedback) {
      return res.status(400).json({ message: "Status and feedback are required" });
    }

    const updated = await MentorshipSubmissionModel.findByIdAndUpdate(
      submissionId,
      { status, feedback },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Submission not found" });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Review submission error:", err);
    return res.status(500).json({ message: "Failed to review submission" });
  }
};

// ==========================================
// 📚 Learning Resources Controller Functions
// ==========================================

export const getResources = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const resources = await MentorshipResourceModel.find({ mentorshipId }).sort({
      createdAt: -1,
    });
    return res.status(200).json(resources);
  } catch (err) {
    console.error("Get resources error:", err);
    return res.status(500).json({ message: "Failed to fetch resources" });
  }
};

export const addResource = async (req: Request, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const { title, link, notes } = req.body;

    if (!title || !link) {
      return res.status(400).json({ message: "Title and link are required" });
    }

    const newResource = new MentorshipResourceModel({
      mentorshipId,
      title,
      link,
      notes,
    });
    await newResource.save();

    return res.status(201).json(newResource);
  } catch (err) {
    console.error("Add resource error:", err);
    return res.status(500).json({ message: "Failed to add resource" });
  }
};
