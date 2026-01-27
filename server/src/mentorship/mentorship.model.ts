import mongoose, { model, Schema } from "mongoose";

const schema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mentor: {
      type: mongoose.Types.ObjectId,
      ref: "MentorDetails",
      required: true,
    },

    planId: {
      type: mongoose.Types.ObjectId, // _id from mentor.plans[]
      required: true,
    },

    planSnapshot: {
      title: String,
      price: Number,
      duration: Number, // days
    },

    startingDate: {
      type: Date,
      required: true,
    },

    endingDate: {
      type: Date,
      required: true,
    },

    paymentId: {
      type: String,
      required: true,
      unique: true, // 👈 webhook idempotency
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

const MentorshipModel = model("Mentorship", schema);
export default MentorshipModel;
