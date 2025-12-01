import express from 'express'
const TagsRouter =  express.Router()
import { createTags, deleteTags, fetchTags} from './tags.controller' 

TagsRouter.get('/',fetchTags)
TagsRouter.post("/",createTags);
TagsRouter.delete("/:id",deleteTags)
export default TagsRouter