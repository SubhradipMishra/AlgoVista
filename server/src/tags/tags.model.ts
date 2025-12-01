import {model,Schema} from "mongoose" 

const  schema = new Schema({
	title:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    }

},{timestamps:true})

const TagsModel = model('Tags',schema)

export default TagsModel