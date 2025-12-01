import mongoose, { model } from "mongoose";

const resultSchema = new mongoose.Schema({
  input: String,
  expected: String,
  output: String,
  status: String, // Accepted, Wrong Answer, Compile Error, Runtime Error, TLE
  time: String,
  memory: Number,
});

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    language_id: { type: Number, required: true },
    source_code: { type: String, required: true },

    results: [resultSchema],
    verdict: String, // Overall verdict
    score: Number,

    createdAt: { type: Date, default: Date.now },
    finishedAt: Date,
  },
  { timestamps: true }
);

const SubmissionModel = model("Submission",submissionSchema) ;

export default SubmissionModel; 