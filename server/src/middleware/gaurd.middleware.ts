import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const expireSession = async (res: Response) => {
  res.cookie("accessToken", null, {
    maxAge: 0,
    domain: process.env.NODE_ENV === "dev" ? undefined : process.env.DOMAIN,
    secure: process.env.NODE_ENV === "dev" ? false : true,
    httpOnly: true,
  });
  res.cookie("refreshToken", null, {
    maxAge: 0,
    domain: process.env.NODE_ENV === "dev" ? undefined : process.env.DOMAIN,
    secure: process.env.NODE_ENV === "dev" ? false : true,
    httpOnly: true,
  });

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

    // console.log("Hit su")
    
    const { accessToken } = req.cookies;
    // console.log("Access Token " , req.cookies);
    if (!accessToken) return expireSession(res);

    const payload: any = jwt.verify(
      accessToken,
      process.env.AUTH_SECRET as string
    );

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