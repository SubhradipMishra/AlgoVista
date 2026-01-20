import { model, Schema } from "mongoose";

const mentorSchema = new Schema(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },

    noOfMentees: {
      type: Number,
      default: 0,
    },

    maximumNoOfMentees: {
      type: Number,
      default: 10,
    },

    features: {
      type: [String],
      default: [],
    },

    specializations: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    plans: {
      type: [
        {
          title: { type: String, required: true },
          price: { type: Number, required: true },
          whatCanDo: { type: [String], default: [] },
          whatCannotDo: { type: [String], default: [] },
          duration: { type: Number, default: 30 }, // days
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// ✅ Virtual: mentor capacity
mentorSchema.virtual("hasCapacity").get(function () {
  return this.noOfMentees < this.maximumNoOfMentees;
});

const MentorDetailsModel = model("MentorDetails", mentorSchema);
export default MentorDetailsModel;
