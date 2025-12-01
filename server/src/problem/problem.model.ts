import mongoose, { model } from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
});

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },

    constraints: { type: String },
    starterCode: { type: String, default: "// Write your code here\n" },

    testCases: { type: [testCaseSchema], default: [] },       // hidden
    publicTestCases: { type: [testCaseSchema], default: [] }, // visible

    // 🔥 Newly Added Fields with Defaults
    tags: { type: [String], default: [] },         // e.g. ["String", "Two-Pointer"]
    hints: { type: String, default: "" },          // simple string hint
    company: { type: [String], default: [] },      // e.g. ["Google", "Amazon"]

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ProblemModel = model("Problem", problemSchema);
export default ProblemModel;
