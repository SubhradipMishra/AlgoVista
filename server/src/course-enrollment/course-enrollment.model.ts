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
  status: {
    type: String,
    enum: ["enrolled", "completed","ongoing"],
    default: "enrolled",
  },
	
},{timestamps:true})

const CourseEnrollmentModel = model('CourseEnrollment',schema)

export default CourseEnrollmentModel