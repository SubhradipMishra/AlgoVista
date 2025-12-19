import { model, Schema } from "mongoose";

const mentorSchema = new Schema(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    mentees: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
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

    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },

    ratings: {
      type: [Number],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    feedbacks: {
      type: [
        {
          mentee: { type: Schema.Types.ObjectId, ref: "User" },
          comment: { type: String, default: "" },
          rating: { type: Number, default: 0 },
          date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // Contact / Meeting links
    meetingLinks: {
      type: [String],
      default: [],
    },

    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // History of mentees
    mentorshipHistory: {
      type: [
        {
          mentee: { type: Schema.Types.ObjectId, ref: "User" },
          startDate: { type: Date, default: Date.now },
          endDate: { type: Date },
          status: {
            type: String,
            enum: ["active", "completed", "terminated"],
            default: "active",
          },
        },
      ],
      default: [],
    },

   
    plans: {
      type: [
        {
          title:{
            type:String,
            required:true
          },
          price: {
            type: Number,
            default: 0,
          },
          whatCanDo: {
            type: [String],
            default: [],
          },
          whatCannotDo: {
            type: [String],
            default: [],
          },
          duration: {
            type: Number, // days
            default: 30,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual: capacity check
mentorSchema.virtual("hasCapacity").get(function () {
  return this.noOfMentees < this.maximumNoOfMentees;
});

const MentorDetailsModel = model("MentorDetails", mentorSchema);
export default MentorDetailsModel;
