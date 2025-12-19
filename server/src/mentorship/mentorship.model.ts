import { Schema, model } from "mongoose";

const mentorshipSchema = new Schema(
  {
    mentor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mentee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      title: String,
      price: Number,
      duration: Number,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "completed", "terminated", "paused"],
      default: "active",
      index: true,
    },

    paymentId: {
      type: String,
    },
  },
  { timestamps: true }
);


const MentorshipModel = model("Mentorship",mentorshipSchema);

export default MentorshipModel ;
