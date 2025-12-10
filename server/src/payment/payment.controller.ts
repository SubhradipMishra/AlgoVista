import courseModel from '../course/course.model';
import PaymentModel from './payment.model'
import Razorpay from "razorpay";
import fs from "fs";
//controller

import { Request, Response } from "express"
import { createOrder } from '../order/order.controller';


const instance = new Razorpay({
  key_id: "rzp_test_RpG7PsiR24EZK5",
  key_secret: "N5ZdLaR0LIzAvGaPMKpIQV8Y",
});


export const generateOrder = async(req:Request, res:Response)=>{

	try{

	
		const {productId} = req.body ; 

			console.log(productId);
		const product = await courseModel.findById(productId) ;
	    if (!product) return res.status(400).json({ message: "Bad Request!" });
        
		const price = product.discountPrice ; 
		 const order = await instance.orders.create({
      amount: price * 100,
      currency: "INR",
      receipt: `AlgoVista_${Date.now()}`,
    });

	 console.log(order);
    return res.json(order);
	}

	catch(err:any){
		console.log(err);
    return res.status(500).json(err);
	}

}


const payementSuccess = async (req:any) => {
  const rawBody = req.body.toString();
  const data = JSON.parse(rawBody);

  const payment = data.payload.payment.entity;
  const notes = payment.notes;

  return createOrder({
    user: notes.user,             
    product: notes.product,         
    paymentId: payment.id,          
    discount: Number(notes.discount)
  });
  
};

const paymentFailed = async () => {
  console.log("failed!");
};


export const webhook = async (req:any,res:any) => {
  try {
    const rawBody = req.body.toString();
    const data = JSON.parse(rawBody);

    fs.writeFileSync("payment.json", JSON.stringify(data, null, 2));

    const payload = data;

    if (payload.event === "payment.captured")
      return payementSuccess(req);

    if (payload.event === "payment.failed")
      return paymentFailed();
  } catch (err:any) {
    console.log(err);
    return res.status(500).json({ message: "Webhook error" });
  }
};