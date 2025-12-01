import mongoose, { Schema, Document } from "mongoose";

interface Resource {
  title: string;
  completed: boolean;
  completedAt?: Date | null;
}

interface Subtopic {
  subtopicName: string;
  resources: Resource[];
  completedCount: number;
  totalResources: number;
  progressPercent: number;
}

export interface IRoadmapProgress extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  subtopics: Subtopic[];
  overallProgress: number;
  updatedAt: Date;
}

const RoadmapProgressSchema = new Schema<IRoadmapProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
    subtopics: [
      {
        subtopicName: { type: String, required: true },
        resources: [
          {
            title: { type: String, required: true },
            completed: { type: Boolean, default: false },
            completedAt: { type: Date, default: null },
          },
        ],
        completedCount: { type: Number, default: 0 },
        totalResources: { type: Number, default: 0 },
        progressPercent: { type: Number, default: 0 },
      },
    ],
    overallProgress: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Force collection name = "roadmapprogresses"
export default mongoose.model<IRoadmapProgress>(
  "RoadmapProgress",
  RoadmapProgressSchema,
  "roadmapprogresses"
);
