import express from 'express'
const MentorManagerRouter =  express.Router()
import { fetchMentorManager} from './mentor-manager.controller' 

MentorManagerRouter.get('/',fetchMentorManager)

export default MentorManagerRouter