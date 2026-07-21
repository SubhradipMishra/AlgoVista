// @ts-nocheck
import mongoose, { Schema, model } from "mongoose";

const AlgoTufSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      default: 5999,
    },
    programName: {
      type: String,
      default: "AlgoTUF Elite",
    },
    benefits: [
      {
        name: { type: String },
        duration: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "active",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const AlgoTufModel = model("AlgoTufElite", AlgoTufSchema);
export default AlgoTufModel;
