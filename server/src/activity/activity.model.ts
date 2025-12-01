import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String, // e.g. "MernStackRoadmap", "BubbleSortVisualizer"
      required: true,
      trim: true,
    },
    route: {
      type: String, // e.g. "/roadmap/mernstack" or "/visualizer/bubblesort"
      required: true,
      trim: true,
    },
    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const ActivityModel = mongoose.model("Activity", activitySchema);
export default ActivityModel;
