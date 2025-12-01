import TagsModel from './tags.model'
//controller

import { Request, Response } from "express"

export const fetchTags = async(req:Request , res:Response) => {
   try{
      const tags =  await TagsModel.find();
	   return res.json(tags);
   }
   catch(err:any){
	res.status(500).json({message:"Failed to fetch tags"})
   }
}

export const deleteTags = async(req:Request , res:Response)=>{
   try{
    const tag = await TagsModel.findByIdAndDelete(req.params.id);
	if(!tag)
		return res.status(500).json({message:"Tag is not found!"})
   
   return res.status(200).json({message:"Tag delete successfully!"})
}
   catch(err:any){
	 res.status(500).json({message:"Failed to delete tag!"})
   }

}
export const createTags =async (req:Request , res:Response)=>{
	try{

		    const newTags = new TagsModel(req.body);
			await newTags.save();
			res.json({message:"Tags Created Successfully!"})
	}
	catch(err:any){
		res.status(500).json({message:"Failed to Create Tags!"});
	}
}