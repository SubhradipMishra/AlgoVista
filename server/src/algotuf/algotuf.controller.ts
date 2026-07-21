// @ts-nocheck
import { Request, Response } from "express";
import AlgoTufModel from "./algotuf.model";

export const getAlgoTufProgramDetails = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      program: {
        name: "AlgoTUF Elite",
        price: 5999,
        discount: 0,
        collaboration: "takeUforward (TUF) x AlgoVista",
        image: "/images/algotuf.png",
        perks: [
          {
            title: "TUF Sprint Package",
            duration: "18 Months",
            icon: "rocket",
            description: "Access top-tier curated DSA sheets, practice modules & sprint challenges from takeUforward.",
          },
          {
            title: "AlgoVista MERN Stack Full Course",
            duration: "12 Months",
            icon: "code",
            description: "Comprehensive end-to-end full-stack web development with real-world production projects.",
          },
          {
            title: "AlgoVista Premium System Design Roadmap",
            duration: "6 Months",
            icon: "layer",
            description: "Master Low-Level (LLD) & High-Level (HLD) architecture for scalable tech interviews.",
          },
          {
            title: "Group Mentorship Program",
            duration: "1 Month",
            icon: "users",
            description: "Direct live guidance, resume reviews, and weekly live Q&A with industry veteran mentors.",
          },
        ],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserAlgoTufStatus = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user._id;
    const enrollment = await AlgoTufModel.findOne({ user: userId, status: "active" }).populate("user", "fullname email");
    
    if (!enrollment) {
      return res.json({ success: true, enrolled: false });
    }

    return res.json({
      success: true,
      enrolled: true,
      enrollment,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
