import mongoose, { model } from "mongoose";

// Resource schema inside subtopics
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },
});

// Subtopic schema with multiple resources
const subtopicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  resources: { type: [resourceSchema], default: [] },
});

// Main roadmap schema
const roadmapSchema = new mongoose.Schema(
  {
    moduleTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    order: { type: Number, required: true, unique: true },
    subtopics: { type: [subtopicSchema], default: [] },
    tags: { type: [String], default: [] },
    learners: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const RoadmapModel = model("Roadmap", roadmapSchema);
export default RoadmapModel;
