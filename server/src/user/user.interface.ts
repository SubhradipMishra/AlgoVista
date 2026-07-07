// @ts-nocheck
import mongoose from "mongoose";

interface UserInterface {
  _id: mongoose.Types.ObjectId; 
  fullname: string;
  email: string;
  password: string;
  role: string;
  xp?: number;
  level?: number;
  rank?: string;
  streak?: number;
  accuracy?: number;
  globalRank?: number;
  totalSolved?: number;
  solved?: {
    easy: number;
    medium: number;
    hard: number;
  } | null;
  badges?: Array<{
    key: string;
    label: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>;
}

export default UserInterface;
