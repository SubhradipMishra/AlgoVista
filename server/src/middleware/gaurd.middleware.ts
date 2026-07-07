// @ts-nocheck
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";

const isDev = () => process.env.NODE_ENV === "dev";

const expireSession = async (res: Response) => {
  const opts: any = {
    maxAge: 0,
    httpOnly: true,
    secure: !isDev(),
    sameSite: isDev() ? "lax" : "none",
    ...(isDev() ? {} : { domain: process.env.DOMAIN }),
  };
  res.cookie("accessToken", null, opts);
  res.cookie("refreshToken", null, opts);

  res.status(400).json({ message: "Bad Request" });
};


export const UserGuard = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) return expireSession(res);

    const payload: any = jwt.verify(
      accessToken,
      process.env.AUTH_SECRET as string
    );

    req.user = payload;
    next();
  } catch (error) {
    console.error("UserGuard Error:", error);
    return expireSession(res);
  }
};


export const AdminGuard = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
        const { accessToken } = req.cookies;

    if (!accessToken) return expireSession(res);

    const payload: any = jwt.verify(
      accessToken,
      process.env.AUTH_SECRET as string
    );

    if (payload.role !== "admin") return expireSession(res);

    req.user = payload;
    console.log("success....")
    next();
  } catch (error) {
    console.error("AdminGuard Error:", error);
    return expireSession(res);
  }
};

export const AdminUserGuard = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log('hit')
    const { accessToken } = req.cookies;
    // console.log(accessToken);
    
    if (!accessToken) return expireSession(res);

    const payload: any = jwt.verify(
      accessToken,
      process.env.AUTH_SECRET as string
    );

    if (payload.role !== "admin" && payload.role !== "user") {
      return expireSession(res);
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("AdminUserGuard Error:", error);
    return expireSession(res);
  }
};

export const AdminSuperAdminGaurd = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.cookies;
    // console.log(req);
    if (!accessToken) return expireSession(res);

    const payload: any = jwt.verify(
      accessToken,
      process.env.AUTH_SECRET as string
    );

    if (payload.role !== "admin" && payload.role !== "super") {
      return expireSession(res);
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("AdminUserGuard Error:", error);
    return expireSession(res);
  }
};


export const SuperAdminGaurd = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
   
  try {

    const { accessToken } = req.cookies;
    if (!accessToken) return expireSession(res);

    const payload: any = jwt.verify(
      accessToken,
      process.env.AUTH_SECRET as string
    );

    if (payload.role !== "super-admin") { 
      return expireSession(res);
    }

  

    req.user = payload;
    next();
  } catch (error) {
    console.error("AdminUserGuard Error:", error);
    return expireSession(res);
  }
};

export const AdminUserSuperAdminGuard = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {

    console.log("Hit super")
    
    const { accessToken } = req.cookies;
    console.log("Access Token ",req.cookies);
    if (!accessToken) return expireSession(res);

    const payload: any = await jwt.verify(
      accessToken,
      process.env.AUTH_SECRET as string
    );

    console.log("payload" , payload);

    if (
      payload.role !== "admin" &&
      payload.role !== "user" &&
      payload.role !== "super-admin"
    ) {
      return expireSession(res);
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("AdminUserSuperAdminGuard Error:", error);
    return expireSession(res);
  }
};





export const RefreshTokenGaurd = async ( req: any,res: Response,next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return expireSession(res);

    const payload: any = jwt.verify(
      refreshToken,
      process.env.RT_SECRET as string
    );

    if (payload.role !== "admin" && payload.role !== "user") {
      return expireSession(res);
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error(" RefreshTokenGaurd Error:", error);
    return expireSession(res);
  }
};



export const RazorpayGaurd = async (req:any, res:any, next:NextFunction) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    console.log("[Razorpay Webhook] Webhook request received. Checking signature...");
  
    const payload = typeof req.body === "string"
      ? req.body
      : Buffer.isBuffer(req.body)
        ? req.body.toString()
        : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", (process.env.RZP_WEBHOOK_SECRET || "") as string)
      .update(payload)
      .digest("hex");

    console.log("[Razorpay Webhook] Received Signature:", signature);
    console.log("[Razorpay Webhook] Expected Signature:", expectedSignature);

    if (signature !== expectedSignature) {
      console.error("[Razorpay Webhook] Webhook signature verification mismatch! Please check RZP_WEBHOOK_SECRET in .env.");
      return res.status(401).json({ message: "BAD REQUEST!" });
    }

    next();
  } 
  catch (err) {
    console.error("[Razorpay Webhook] Error in RazorpayGuard signature verification:", err);
    return res.status(401).json({ message: "Invalid Token" });
  }
};
