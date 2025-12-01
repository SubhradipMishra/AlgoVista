import MentorManagerModel from './mentor-manager.model'
//controller

import { Request, Response } from "express"

export const fetchMentorManager = (req:Request , res:Response) => {
	res.send("Hello")
}