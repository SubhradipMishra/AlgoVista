import TopicsModel from './topics.model'
//controller

import { Request, Response } from "express"

export const fetchTopics = async(req:Request , res:Response) => {
	try{
     
		console.log("fetch topics")
		const topics = await TopicsModel.find();
		return res.json(topics);
	}
	catch(err:any){
		return res.status(500).json(err);
	}
}

export const createTopics = async(req:Request , res:Response) => {
	try{
     
		 const newTopic = new TopicsModel(req.body);
		 await newTopic.save() ; 
		 res.json({message:"Topics Created Successfully!"})

	}
	catch(err:any){
		return res.status(500).json(err);
	}
}


export const deleteTopics = async(req:Request , res:Response) => {
	try{

		console.log("Delete topics.....")
     
		const topics = await TopicsModel.findByIdAndDelete(req.params.id);
		 if(!topics)
			return res.status(404).json({message:"Topics is not found!"})
		 res.json({message:"Topics delete Successfully!"})

	}
	catch(err:any){
		return res.status(500).json(err);
	}
}