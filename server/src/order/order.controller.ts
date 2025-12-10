import OrderModel from "./order.model"

import { Request, Response } from "express";

export const fetchOrder = async(req:Request,res:Response)=>{
    try{

        const orders =  await OrderModel.find();

        return res.json(orders);
    }
    catch(err:any){
        return res.status(200).json({message:"Failed to fetch orders"})
    }
}



// helper function for webhook



export const createOrder = async(data:any)=>{
    try{

        const order = new OrderModel(data) ;
        await order.save();
        return order ;
    }
    catch(err:any){
        return err ; 
    }
}