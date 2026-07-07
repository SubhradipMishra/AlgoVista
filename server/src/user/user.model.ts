// @ts-nocheck
import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const badgeSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "trophy" },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },

    // Profile Details
    education: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    description: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    rank: { type: String, default: "Rookie" },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: null },
    accuracy: { type: Number, default: 0 },
    globalRank: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    solved: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    badges: { type: [badgeSchema], default: [] },

    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const UserModel = model("User", userSchema);
export default UserModel;
