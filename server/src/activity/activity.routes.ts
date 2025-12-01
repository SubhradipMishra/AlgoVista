import express from 'express'
const ActivityRouter =  express.Router()
import { createActivity, fetchActivity, fetchActivityByUser} from './activity.controller' 
import { AdminUserGuard } from '../middleware/gaurd.middleware';

ActivityRouter.get('/',fetchActivity)
ActivityRouter.get("/byId",AdminUserGuard,fetchActivityByUser) ;
ActivityRouter.post("/",AdminUserGuard , createActivity)

export default ActivityRouter