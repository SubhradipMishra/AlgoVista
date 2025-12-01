import SkillsModel from './skills.model'


import { Request, Response } from "express"

export const fetchSkills = async(req:Request , res:Response) => {
	try{
       const skills = await SkillsModel.find();
	   return res.json(skills);
	}
	catch(err:any){
		return res.status(500).json({message:"Failed to fetch Skills!"})
	}
}


export const createSkills = async(req:Request , res:Response) => {
	try{
       const skills = new SkillsModel(req.body);
	   await skills.save() ;
	   return res.json(skills);
	}
	catch(err:any){
		return res.status(500).json({message:"Failed to create Skills!"})
	}
}

export const deleteSkills = async(req:Request , res:Response) => {
	try{
		console.log("Delete skills......")
       const skills:any =await SkillsModel.findByIdAndDelete(req.params.id);
	 if(!skills)
		 return  res.status(404).json({message:"SKills is not found"})

	 return res.json({message:"Skills deleted successfully."})
	}
	catch(err:any){
		return res.status(500).json({message:"Failed to fetch Skills!"})
	}
}




