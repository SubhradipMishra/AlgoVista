import { Request, Response } from "express";
import UserModel from "./user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import UserInterface from "./user.interface";
const FOURTEEN_MINUTE = 14 * 60 * 1000;
const SIX_DAYS = 6 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

// -------------------- SESSION --------------------
export const session = async (req: any, res: Response) => {
  try {
    console.log("Session hit");
    res.json(req.user);
  } catch (err: any) {
    return res.status(500).json(err);
  }
};

export const fetchUserById  = async(req:any , res:Response)=>{
   try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required!" });
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "No user found!" });
    return res.json(user);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch user!" });
  }
}


export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mishrasubhradip2005@gmail.com",
    pass: "enzgvicmxeywikjd",
  },
  logger: true,     // <-- logs to console
  debug: true,      // <-- enables SMTP debugging
});



export const sendCredentialsMail = async (email: any, username: any, password: any) => {
  console.log("📧 Preparing to send credentials email...");
  console.log("To:", email);
  console.log("Username:", username);
  console.log("Password:", password);

  const mailOptions = {
    from: `"AlgoVista" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Your AlgoVista Account Credentials",
    html: `
  <div style="background:#0A0F1A; padding:30px; color:#e5e5e5; font-family:Arial, sans-serif;">
    
    <div style="max-width:600px; margin:0 auto; background:#0F172A; padding:30px; border-radius:12px; border:1px solid #1E293B;">
      
      <h1 style="text-align:center; color:#3B82F6; margin-bottom:20px;">
        👋 Welcome to <span style="color:#60A5FA;">AlgoVista</span>
      </h1>

      <p style="font-size:15px; line-height:1.7; color:#cbd5e1;">
        Hello <strong style="color:#93c5fd;">${username}</strong>, <br/><br/>
        Your account has been successfully created on 
        <strong style="color:#3b82f6;">AlgoVista – The Real-Time DSA Battle Platform</strong>.
      </p>

      <div style="
        background:#1E293B; 
        padding:20px; 
        border-radius:10px; 
        margin-top:20px;
        border:1px solid #334155;
      ">
        <h3 style="color:#60A5FA; margin-top:0;">🔐 Your Login Credentials</h3>

        <p style="font-size:14px; color:#e2e8f0;">
          <strong style="color:#93c5fd;">Email:</strong> ${email}<br/>
          <strong style="color:#93c5fd;">Password:</strong> ${password}
        </p>
      </div>

      <p style="margin-top:25px; color:#cbd5e1; font-size:14px; line-height:1.6;">
        ⚠️ <strong style="color:#60A5FA;">Security Reminder:</strong><br/>
        Please log in and <strong>change your password immediately</strong> to keep your account safe.
      </p>

      <div style="
        margin-top:30px;
        padding:20px;
        background:#0A0F1A;
        border-radius:10px;
        border:1px solid #1E293B;
        text-align:center;
      ">
        <p style="color:#64748b; font-size:13px; margin-bottom:10px;">
          Need help? Facing any issue?
        </p>
        <a href="mailto:algovista.support@gmail.com"
           style="color:#3B82F6; text-decoration:none; font-weight:bold;">
          Contact AlgoVista Support →
        </a>
      </div>

      <p style="margin-top:30px; text-align:center; color:#475569; font-size:12px;">
        © ${new Date().getFullYear()} AlgoVista. All Rights Reserved.
      </p>

    </div>

  </div>
`

  };

  console.log("📨 Mail options prepared:", mailOptions);

  try {
    const result = await mailer.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("📩 SMTP Response:", result);
    return result;
  } catch (error: any) {
    console.error("❌ Email sending failed!");
    console.error("Error message:", error.message);
    console.error("Full Error:", error);
  }
};



export const signup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { fullname, email, password, role, createdBy } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let createdById: any = null;

    // Only allow admin creation by super-admin
    if (role === "admin" && createdBy) {
      const superA: any = await UserModel.findOne({ email: createdBy });
      if (!superA) {
        return res.status(400).json({ message: "Super-admin (createdBy) not found" });
      }
      createdById = superA._id;
    }

    // Generate default password if not provided
    let defaultPassword: string;
    if (password && password.trim()) {
      defaultPassword = password.trim();
    } else {
      const base = email.split("@")[0];
      defaultPassword = `${base}@2005`;
    }

    console.log("Default Password:", defaultPassword);

    const newUserData: any = {
      fullname,
      email,
      password: defaultPassword, // hashed by schema
      role: role || "user",
      createdBy: role === "admin" ? createdById : null,
      active: true,
    };

    const newUser = new UserModel(newUserData);
    await newUser.save();

    // ✅ Send email with login credentials
   
    // Send email with login credentials
console.log("📤 Attempting to send email to:", email);
await sendCredentialsMail(email, fullname, defaultPassword);
console.log("📬 Email sending function executed.");



    return res.status(201).json({
      fullname: newUser.fullname,
      email: newUser.email,
      defaultPassword,
      message: "User created & credentials sent to email",
    });

  } catch (err: any) {
    console.error("Error creating user:", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


// -------------------- TOKEN GENERATION --------------------
const generateToken = (user: UserInterface) => {
  const payload = {
    id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.AUTH_SECRET as string, {
    expiresIn: "30d",
  });

  const refreshToken = jwt.sign(payload, process.env.RT_SECRET as string, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// -------------------- LOGIN --------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.active === false) {
      return res.status(403).json({ message: "Account deactivated. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateToken(user);

    res.cookie("accessToken", accessToken, {
      maxAge: SIX_DAYS,
      domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
      secure: process.env.NODE_ENV !== "dev",
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: SIX_DAYS,
      domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
      secure: process.env.NODE_ENV !== "dev",
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Error logging in:", err.message);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

// -------------------- LOGOUT --------------------
export const logout = async (req: Request, res: Response) => {
  res.cookie("accessToken", null, {
    maxAge: 0,
    domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
    secure: process.env.NODE_ENV !== "dev",
    httpOnly: true,
  });
  res.cookie("refreshToken", null, {
    maxAge: 0,
    domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
    secure: process.env.NODE_ENV !== "dev",
    httpOnly: true,
  });
  res.json({ message: "Logout success!" });
};

// -------------------- REFRESH TOKEN --------------------
export const refreshToken = async (req: any, res: Response) => {
  const user: any = await UserModel.findById(req.user.id);
  if (!user) {
    res.cookie("accessToken", null, { maxAge: 0 });
    res.cookie("refreshToken", null, { maxAge: 0 });
    return res.status(401).json({ message: "User not found" });
  }

  const { accessToken, refreshToken } = generateToken(user);
  res.cookie("accessToken", accessToken, { maxAge: SIX_DAYS, httpOnly: true });
  res.cookie("refreshToken", refreshToken, { maxAge: SIX_DAYS, httpOnly: true });
  res.status(200).json({ message: "Tokens refreshed" });
};

// -------------------- UPDATE USER INFO --------------------
export const updateUser = async (req: any, res: Response) => {
  try {

  
    const userId = req.params.id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    

    // if (user.role === "user" || user.role === "admin" && req.user.id !== userId)
    //   return res.status(403).json({ message: "Cannot update other users" });

    console.log(user);

    const updateFields: any = {};
    const allowedFields = [
      "fullname",
      "education",
      "skills",
      "experience",
      "description",
      "profileImage",
      "socialLinks",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateFields, { new: true });
    return res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

// -------------------- FETCH MENTORS --------------------
export const fetchMentor = async (req: Request, res: Response) => {
  try {
    const mentors = await UserModel.find({ role: "admin" });
    return res.status(200).json({ mentors });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch mentors!" });
  }
};

export const fetchMentorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required!" });
    const mentor = await UserModel.findById(id);
    if (!mentor) return res.status(404).json({ message: "No mentor found!" });
    return res.json(mentor);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch mentor!" });
  }
};

export const fetchMentorBySuperAdmin = async (req: any, res: Response) => {
  try {
    const id = req.user.id;
    if (!id) return res.status(400).json({ message: "Id not found!" });
    const mentor = await UserModel.find({ createdBy: id });
    if (!mentor) return res.status(404).json({ message: "No mentor found!" });
    return res.json(mentor);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch mentor!" });
  }
};

// -------------------- CHANGE PASSWORD --------------------
export const changePassword = async (req: any, res: Response) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatchOld = await bcrypt.compare(oldPassword, user.password);
    if (!isMatchOld)
      return res.status(403).json({ message: "Incorrect old password" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    user.password = newPassword;
    await user.save();

    // ✅ Clear tokens (if stored in cookies)
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // ✅ Ask frontend to redirect
    return res
      .status(200)
      .json({ message: "Password changed successfully. Please log in again." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

