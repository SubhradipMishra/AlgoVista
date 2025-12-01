import {model,Schema} from "mongoose" 

const  schema = new Schema({

    name:{
        type:String,
        required:true,  
        lowercase:true,

    },
    email:{
        
    }

	
},{timestamps:true})

const MentorManagerModel = model('MentorManager',schema)

export default MentorManagerModel