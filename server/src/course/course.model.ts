import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      lowercase: true,
    },

    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    duration: {
      type: String,
      required: true,
    },

    instructor: {
      type: [String],
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    modules: [
      {
        title: {
          type: String,
          required: true,
        },
        submodules: [
          {
            title: {
              type: String,
              required: true,
            },
            videoUrl: {
              type: String,
              default: null,
            },
            pdfUrl: {
              type: String,
              default: null,
            },
            description: {
              type: String,
              default: "",
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const CourseModel = model("Course", schema);

export default CourseModel;
