"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayGaurd = exports.RefreshTokenGaurd = exports.AdminUserSuperAdminGuard = exports.SuperAdminGaurd = exports.AdminSuperAdminGaurd = exports.AdminUserGuard = exports.AdminGuard = exports.UserGuard = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const expireSession = async (res) => {
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
const UserGuard = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken)
            return expireSession(res);
        const payload = jsonwebtoken_1.default.verify(accessToken, process.env.AUTH_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        console.error("UserGuard Error:", error);
        return expireSession(res);
    }
};
exports.UserGuard = UserGuard;
const AdminGuard = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken)
            return expireSession(res);
        const payload = jsonwebtoken_1.default.verify(accessToken, process.env.AUTH_SECRET);
        if (payload.role !== "admin")
            return expireSession(res);
        req.user = payload;
        console.log("success....");
        next();
    }
    catch (error) {
        console.error("AdminGuard Error:", error);
        return expireSession(res);
    }
};
exports.AdminGuard = AdminGuard;
const AdminUserGuard = async (req, res, next) => {
    try {
        // console.log('hit')
        const { accessToken } = req.cookies;
        // console.log(accessToken);
        if (!accessToken)
            return expireSession(res);
        const payload = jsonwebtoken_1.default.verify(accessToken, process.env.AUTH_SECRET);
        if (payload.role !== "admin" && payload.role !== "user") {
            return expireSession(res);
        }
        req.user = payload;
        next();
    }
    catch (error) {
        console.error("AdminUserGuard Error:", error);
        return expireSession(res);
    }
};
exports.AdminUserGuard = AdminUserGuard;
const AdminSuperAdminGaurd = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        // console.log(req);
        if (!accessToken)
            return expireSession(res);
        const payload = jsonwebtoken_1.default.verify(accessToken, process.env.AUTH_SECRET);
        if (payload.role !== "admin" && payload.role !== "super") {
            return expireSession(res);
        }
        req.user = payload;
        next();
    }
    catch (error) {
        console.error("AdminUserGuard Error:", error);
        return expireSession(res);
    }
};
exports.AdminSuperAdminGaurd = AdminSuperAdminGaurd;
const SuperAdminGaurd = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken)
            return expireSession(res);
        const payload = jsonwebtoken_1.default.verify(accessToken, process.env.AUTH_SECRET);
        if (payload.role !== "super-admin") {
            return expireSession(res);
        }
        req.user = payload;
        next();
    }
    catch (error) {
        console.error("AdminUserGuard Error:", error);
        return expireSession(res);
    }
};
exports.SuperAdminGaurd = SuperAdminGaurd;
const AdminUserSuperAdminGuard = async (req, res, next) => {
    try {
        console.log("Hit super");
        const { accessToken } = req.cookies;
        console.log("Access Token ", req.cookies);
        if (!accessToken)
            return expireSession(res);
        const payload = await jsonwebtoken_1.default.verify(accessToken, process.env.AUTH_SECRET);
        console.log("payload", payload);
        if (payload.role !== "admin" &&
            payload.role !== "user" &&
            payload.role !== "super-admin") {
            return expireSession(res);
        }
        req.user = payload;
        next();
    }
    catch (error) {
        console.error("AdminUserSuperAdminGuard Error:", error);
        return expireSession(res);
    }
};
exports.AdminUserSuperAdminGuard = AdminUserSuperAdminGuard;
const RefreshTokenGaurd = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken)
            return expireSession(res);
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.RT_SECRET);
        if (payload.role !== "admin" && payload.role !== "user") {
            return expireSession(res);
        }
        req.user = payload;
        next();
    }
    catch (error) {
        console.error(" RefreshTokenGaurd Error:", error);
        return expireSession(res);
    }
};
exports.RefreshTokenGaurd = RefreshTokenGaurd;
const RazorpayGaurd = async (req, res, next) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        console.log("[Razorpay Webhook] Webhook request received. Checking signature...");
        const payload = typeof req.body === "string"
            ? req.body
            : Buffer.isBuffer(req.body)
                ? req.body.toString()
                : JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac("sha256", (process.env.RZP_WEBHOOK_SECRET || ""))
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
exports.RazorpayGaurd = RazorpayGaurd;
