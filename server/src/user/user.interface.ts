import mongoose from "mongoose";

interface UserInterface {
  _id: mongoose.Types.ObjectId; 
  fullname: string;
  email: string;
  password: string;
  role: string;
}

export default UserInterface;
