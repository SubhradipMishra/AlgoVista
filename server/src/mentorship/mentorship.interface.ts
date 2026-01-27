import mongoose from "mongoose";

interface MentorShipInterface {
  _id: mongoose.Types.ObjectId; 
  fullname: string;
  email: string;
  password: string;
  role: string;
}

export default MentorShipInterface;
