import courseModel from '../course/course.model';
import PaymentModel from './payment.model'
import Razorpay from "razorpay";
import fs from "fs";
import { Types } from "mongoose";
import MentorshipModel from "../mentorship/mentorship.model";
//controller

import { raw, Request, Response } from "express"
import { createOrder } from '../order/order.controller';
import MentorDetailsModel from '../mentor-deatils/mentor-deatils.model';
import { createMentorship } from '../mentorship/mentorship.controller';


const instance = new Razorpay({
  key_id: "rzp_test_RpG7PsiR24EZK5",
  key_secret: "N5ZdLaR0LIzAvGaPMKpIQV8Y",
});


export const generateOrderCourse = async(req:Request, res:Response)=>{

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

const calculateEndingDate = (start: Date, duration: number) => {
  const end = new Date(start);
  end.setDate(end.getDate() + duration); // DAYS
  return end;
};





const mentorEnrollment = async (req: any) => {
  const rawBody = req.body.toString();
  const data = JSON.parse(rawBody);

  const payment = data.payload.payment.entity;
  const notes = payment.notes;

  /* ---------- Idempotency check (VERY IMPORTANT) ---------- */
  const existing = await MentorshipModel.findOne({
    paymentId: payment.id,
  });

  if (existing) return existing;

  /* ---------- Fetch mentor & plan ---------- */
  const mentor = await MentorDetailsModel.findOne(
    {
      mentorId: new Types.ObjectId(notes.mentor),
      "plans._id": new Types.ObjectId(notes.product),
    },
    {
      plans: { $elemMatch: { _id: new Types.ObjectId(notes.product) } },
    }
  );

  if (!mentor || !mentor.plans?.length) {
    throw new Error("Mentorship plan not found");
  }

  const plan = mentor.plans[0];

  /* ---------- Dates ---------- */
  const startingDate = new Date();
  const endingDate = calculateEndingDate(startingDate, plan.duration);

  /* ---------- Create mentorship ---------- */
  const mentorship = await createMentorship({
    user: notes.user,
    mentor: notes.mentor,
    planId: plan._id,

    startingDate,
    endingDate,

    paymentId: payment.id,

    planSnapshot: {
      title: plan.title,
      price: plan.price,
      duration: plan.duration,
    },
  });

  /* ---------- Increment mentor seat count ---------- */
  const result = await MentorDetailsModel.updateOne(
    {
      mentorId: new Types.ObjectId(notes.mentor),
      $expr: { $lt: ["$noOfMentees", "$maximumNoOfMentees"] },
    },
    {
      $inc: { noOfMentees: 1 },
    }
  );

  if (result.modifiedCount === 0) {
    throw new Error("Mentor seat limit reached");
  }

  return mentorship;
};




export const webhook = async (req: any, res: any) => {
  try {
    const rawBody = req.body.toString();
    const payload = JSON.parse(rawBody);

    if (payload.event === "payment.captured") {
      if (payload.payload.payment.entity.notes.mentor) {
        await mentorEnrollment(req);
      } else {
        await payementSuccess(req);
      }
    }

    if (payload.event === "payment.failed") {
      await paymentFailed();
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Webhook error" });
  }
};




export const generateOrderMentor = async (req: any, res: Response) => {
  try {
    const { productId, mentorId,userId } = req.body;

    /* ---------- Validation ---------- */
    if (!productId || !mentorId) {
      return res.status(400).json({
        success: false,
        message: "productId and mentorId are required",
      });
    }

    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId or mentorId",
      });
    }

    /* ---------- Fetch matching plan only ---------- */
    const mentor = await MentorDetailsModel.findOne(
      {
        mentorId: new Types.ObjectId(mentorId),
        "plans._id": new Types.ObjectId(productId),
      },
      {
        plans: { $elemMatch: { _id: new Types.ObjectId(productId) } },
      }
    );

    if (!mentor || !mentor.plans || mentor.plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentorship plan not found",
      });
    }

    const selectedPlan = mentor.plans[0];

    /* ---------- Create Razorpay Order ---------- */
    const order = await instance.orders.create({
  amount: selectedPlan.price * 100,
  currency: "INR",
  receipt: `AlgoVista_${Date.now()}`,
  notes: {
    user: req.user._id,      // 👈 REQUIRED
    mentor: mentorId,        // 👈 REQUIRED
    product: productId,      // 👈 REQUIRED
  },
});


    
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Generate mentorship order error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating order",
    });
  }
};