// @ts-nocheck
import {model,Schema} from "mongoose" 

const  schema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    courseId:{
        type:Schema.Types.ObjectId,
        ref:"Course",
        required:true,
    },
     enrolledAt: {
    type: Date,
    default: Date.now,
  },
   expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Default to 180 days access
  },
  status: {
    type: String,
    enum: ["enrolled", "completed", "ongoing", "expired"],
    default: "enrolled",
  },
	
},{timestamps:true})

const CourseEnrollmentModel = model('CourseEnrollment',schema)

export default CourseEnrollmentModel