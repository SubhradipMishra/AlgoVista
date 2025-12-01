// models/success-story.model.ts
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const successStorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    jobrole: {
      type: String,
      required: true,
      trim: true,
    },
    companyname: {
      type: String,
      required: true,
      trim: true,
    },
    mentorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    offerletter: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const SuccessStoryModel = model("SuccessStory", successStorySchema);

export default SuccessStoryModel;
