"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.fetchMentorBySuperAdmin = exports.fetchMentorById = exports.fetchMentor = exports.uploadProfileImage = exports.updateUser = exports.refreshToken = exports.logout = exports.login = exports.signup = exports.sendCredentialsMail = exports.mailer = exports.fetchUserById = exports.session = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const user_gamification_1 = require("./user.gamification");
const FOURTEEN_MINUTE = 14 * 60 * 1000;
const SIX_DAYS = 6 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;
// -------------------- SESSION --------------------
const session = async (req, res) => {
    try {
        console.log("Session hit");
        res.json(req.user);
    }
    catch (err) {
        return res.status(500).json(err);
    }
};
exports.session = session;
const fetchUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "Id is required!" });
        const snapshot = await (0, user_gamification_1.syncUserGamification)(id);
        if (!snapshot?.user)
            return res.status(404).json({ message: "No user found!" });
        return res.json(snapshot);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to fetch user!" });
    }
};
exports.fetchUserById = fetchUserById;
exports.mailer = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "mishrasubhradip2005@gmail.com",
        pass: "enzgvicmxeywikjd",
    },
    logger: true, // <-- logs to console
    debug: true, // <-- enables SMTP debugging
});
const sendCredentialsMail = async (email, username, password) => {
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
        const result = await exports.mailer.sendMail(mailOptions);
        console.log("✅ Email sent successfully!");
        console.log("📩 SMTP Response:", result);
        return result;
    }
    catch (error) {
        console.error("❌ Email sending failed!");
        console.error("Error message:", error.message);
        console.error("Full Error:", error);
    }
};
exports.sendCredentialsMail = sendCredentialsMail;
const signup = async (req, res) => {
    try {
        const { fullname, email, password, role, createdBy } = req.body;
        // Check if user already exists
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        let createdById = null;
        // Only allow admin creation by super-admin
        if (role === "admin" && createdBy) {
            const superA = await user_model_1.default.findOne({ email: createdBy });
            if (!superA) {
                return res.status(400).json({ message: "Super-admin (createdBy) not found" });
            }
            createdById = superA._id;
        }
        // Generate default password if not provided
        let defaultPassword;
        if (password && password.trim()) {
            defaultPassword = password.trim();
        }
        else {
            const base = email.split("@")[0];
            defaultPassword = `${base}@2005`;
        }
        console.log("Default Password:", defaultPassword);
        const newUserData = {
            fullname,
            email,
            password: defaultPassword, // hashed by schema
            role: role || "user",
            createdBy: role === "admin" ? createdById : null,
            active: true,
        };
        const newUser = new user_model_1.default(newUserData);
        await newUser.save();
        // ✅ Send email with login credentials
        // Send email with login credentials
        console.log("📤 Attempting to send email to:", email);
        await (0, exports.sendCredentialsMail)(email, fullname, defaultPassword);
        console.log("📬 Email sending function executed.");
        return res.status(201).json({
            fullname: newUser.fullname,
            email: newUser.email,
            defaultPassword,
            message: "User created & credentials sent to email",
        });
    }
    catch (err) {
        console.error("Error creating user:", err.message);
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};
exports.signup = signup;
// -------------------- TOKEN GENERATION --------------------
const generateToken = (user) => {
    const payload = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, process.env.AUTH_SECRET, {
        expiresIn: "30d",
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.RT_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};
// -------------------- LOGIN --------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (user.active === false) {
            return res.status(403).json({ message: "Account deactivated. Contact admin." });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
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
    }
    catch (err) {
        console.error("Error logging in:", err.message);
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};
exports.login = login;
// -------------------- LOGOUT --------------------
const logout = async (req, res) => {
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
exports.logout = logout;
// -------------------- REFRESH TOKEN --------------------
const refreshToken = async (req, res) => {
    const user = await user_model_1.default.findById(req.user.id);
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
exports.refreshToken = refreshToken;
// -------------------- UPDATE USER INFO --------------------
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // if (user.role === "user" || user.role === "admin" && req.user.id !== userId)
        //   return res.status(403).json({ message: "Cannot update other users" });
        console.log(user);
        const updateFields = {};
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
            if (req.body[field] !== undefined)
                updateFields[field] = req.body[field];
        }
        const updatedUser = await user_model_1.default.findByIdAndUpdate(userId, updateFields, { new: true });
        return res.status(200).json({ message: "User updated", user: updatedUser });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};
exports.updateUser = updateUser;
const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.params.id;
        const requesterId = req.user?.id;
        const requesterRole = req.user?.role;
        if (!req.file) {
            return res.status(400).json({ message: "Profile image is required" });
        }
        if (requesterRole !== "super-admin" &&
            requesterRole !== "admin" &&
            requesterId !== userId) {
            return res.status(403).json({ message: "You cannot update this profile image" });
        }
        const user = await user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`;
        user.profileImage = profileImageUrl;
        await user.save();
        return res.status(200).json({
            message: "Profile image uploaded successfully",
            profileImage: profileImageUrl,
            user,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || "Failed to upload profile image" });
    }
};
exports.uploadProfileImage = uploadProfileImage;
// -------------------- FETCH MENTORS --------------------
const fetchMentor = async (req, res) => {
    try {
        const mentors = await user_model_1.default.find({ role: "admin" });
        return res.status(200).json({ mentors });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to fetch mentors!" });
    }
};
exports.fetchMentor = fetchMentor;
const fetchMentorById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "Id is required!" });
        const mentor = await user_model_1.default.findById(id);
        if (!mentor)
            return res.status(404).json({ message: "No mentor found!" });
        return res.json(mentor);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to fetch mentor!" });
    }
};
exports.fetchMentorById = fetchMentorById;
const fetchMentorBySuperAdmin = async (req, res) => {
    try {
        const id = req.user.id;
        if (!id)
            return res.status(400).json({ message: "Id not found!" });
        const mentor = await user_model_1.default.find({ createdBy: id });
        if (!mentor)
            return res.status(404).json({ message: "No mentor found!" });
        return res.json(mentor);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to fetch mentor!" });
    }
};
exports.fetchMentorBySuperAdmin = fetchMentorBySuperAdmin;
// -------------------- CHANGE PASSWORD --------------------
const changePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const user = await user_model_1.default.findById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isMatchOld = await bcrypt_1.default.compare(oldPassword, user.password);
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.changePassword = changePassword;
