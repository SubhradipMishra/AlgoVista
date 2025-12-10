


import {Router} from "express" ;
import { fetchOrder } from "./order.controller";
const OrderRouter = Router() ; 


OrderRouter.get("/",fetchOrder) ;


export default OrderRouter;