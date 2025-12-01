import {model,Schema} from "mongoose" 

const  schema = new Schema({
	title:{
        type:String,
        lowercase:true,
        required:true,
        unique:true
    }
},{timestamps:true})

const TopicsModel = model('Topics',schema)

export default TopicsModel