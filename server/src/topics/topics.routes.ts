import express from 'express'
const TopicsRouter =  express.Router()
import { createTopics, deleteTopics, fetchTopics} from './topics.controller' 
import { AdminGuard } from '../middleware/gaurd.middleware';

TopicsRouter.get('/',AdminGuard ,fetchTopics)
TopicsRouter.post('/',AdminGuard,createTopics);
TopicsRouter.delete("/:id",AdminGuard, deleteTopics);

export default TopicsRouter