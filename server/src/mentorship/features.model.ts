import mongoose, { model, Schema } from "mongoose";

// 1. Direct Mentorship Chat Schema
const messageSchema = new Schema(
  {
    mentorshipId: {
      type: mongoose.Types.ObjectId,
      ref: "Mentorship",
      required: true,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "mentor"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 2. 1-on-1 Sessions Scheduler Schema
const sessionSchema = new Schema(
  {
    mentorshipId: {
      type: mongoose.Types.ObjectId,
      ref: "Mentorship",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    joinUrl: {
      type: String,
      default: "https://meet.google.com/abc-defg-hij",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

// 3. Project / Resume Submissions Schema
const submissionSchema = new Schema(
  {
    mentorshipId: {
      type: mongoose.Types.ObjectId,
      ref: "Mentorship",
      required: true,
    },
    type: {
      type: String,
      enum: ["project", "resume"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "rejected"],
      default: "pending",
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const MentorshipMessageModel = model("MentorshipMessage", messageSchema);
export const MentorshipSessionModel = model("MentorshipSession", sessionSchema);
export const MentorshipSubmissionModel = model("MentorshipSubmission", submissionSchema);

// 4. Learning Resources Curation Schema
const resourceSchema = new Schema(
  {
    mentorshipId: {
      type: mongoose.Types.ObjectId,
      ref: "Mentorship",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export const MentorshipResourceModel = model("MentorshipResource", resourceSchema);
