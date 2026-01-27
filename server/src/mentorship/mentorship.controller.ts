import MentorShipInterface from "./mentorship.interface";
import MentorshipModel from "./mentorship.model";
//controller

import { Request, Response } from "express";

export const fetchMentorship = async (req: Request, res: Response) => {
  const mentorShips = await MentorshipModel.find();
  return res.json(mentorShips);
};

export const createMentorship = async (data: any) => {
  try {
    const newMentorship = new MentorshipModel(data);
    await newMentorship.save();
    return newMentorship;
  }
  
  catch (err) {
    console.log(err);
  }
};
