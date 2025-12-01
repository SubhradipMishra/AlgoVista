import {model,Schema} from "mongoose" 

const  schema = new Schema({
	title:{
        type:String,
        required:true,
        lowercase:true,
        unique:true
    }
},{timestamps:true})

const SkillsModel = model('Skills',schema)

export default SkillsModel