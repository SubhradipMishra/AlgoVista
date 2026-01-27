import express from 'express'
const MentorshipRouter =  express.Router()
import { fetchMentorship} from './mentorship.controller' 

MentorshipRouter.get('/',fetchMentorship)

export default MentorshipRouter