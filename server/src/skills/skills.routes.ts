import express from 'express'
const SkillsRouter =  express.Router()
import { createSkills, deleteSkills, fetchSkills} from './skills.controller' 
import { AdminGuard } from '../middleware/gaurd.middleware';

SkillsRouter.get('/',fetchSkills)
SkillsRouter.post("/",AdminGuard,createSkills) ;
SkillsRouter.delete("/:id",AdminGuard , deleteSkills) ;

export default SkillsRouter