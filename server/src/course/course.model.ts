import { model, Schema } from "mongoose";

const SubmoduleSchema = new Schema({
  title: String,
  videoUrl: { type: String, default: null },
  pdfUrl: { type: String, default: null },
  description: { type: String, default: "" },
});

const ModuleSchema = new Schema({
  title: String,
  submodules: [SubmoduleSchema],
});

const CourseSchema = new Schema(
  {
    title: { type: String, required: true, lowercase: true, unique: true },

    thumbnail: { type: String, default: null },
    roadmapImage: { type: String, default: null },

    description: { type: String, required: true },

    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    duration: { type: String, required: true },
    instructor: [{ type: String, required: true }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    modules: [ModuleSchema],
  },
  { timestamps: true }
);

export default model("Course", CourseSchema);
