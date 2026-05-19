"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMentorDetails = exports.updateMentorDetails = exports.getMentorById = exports.getAllMentors = exports.createMentorDetails = void 0;
const mentor_deatils_model_1 = __importDefault(require("./mentor-deatils.model"));
// ---------------------- CREATE ----------------------
const createMentorDetails = async (req, res) => {
    try {
        console.log("create mentor details hit");
        const { mentorId, noOfMentees, maximumNoOfMentees, features, specializations, bio, isAvailable, status, socialLinks, plans, } = req.body;
        if (!mentorId) {
            return res.status(400).json({ message: "mentorId is required" });
        }
        const existing = await mentor_deatils_model_1.default.findOne({ mentorId });
        if (existing) {
            return res.status(400).json({ message: "Mentor details already exist" });
        }
        const newMentor = new mentor_deatils_model_1.default({
            mentorId,
            noOfMentees: noOfMentees ?? 0,
            maximumNoOfMentees: maximumNoOfMentees ?? 10,
            features: features || [],
            specializations: specializations || [],
            bio: bio || "",
            isAvailable: isAvailable ?? true,
            status: status || "active",
            socialLinks: socialLinks || {},
            plans: plans || [],
        });
        await newMentor.save();
        res.status(201).json({
            message: "Mentor details created successfully",
            data: newMentor,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
exports.createMentorDetails = createMentorDetails;
// ---------------------- READ ALL ----------------------
const getAllMentors = async (req, res) => {
    try {
        // console.log("HIT");
        // console.log("REQ:" , req)
        const mentors = await mentor_deatils_model_1.default.find();
        res.status(200).json(mentors);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllMentors = getAllMentors;
// ---------------------- READ SINGLE ----------------------
const getMentorById = async (req, res) => {
    try {
        console.log("HIT MENTOR BY ID.....");
        const { id } = req.params;
        console.log("REQ:", id);
        const mentor = await mentor_deatils_model_1.default.find({ mentorId: id });
        console.log("mentor", mentor);
        if (!mentor)
            return res.status(404).json({ message: "Mentor not found" });
        res.status(200).json(mentor);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getMentorById = getMentorById;
// ---------------------- UPDATE ----------------------
const updateMentorDetails = async (req, res) => {
    try {
        console.log("update mentor details hit....");
        const { id } = req.params;
        const updates = req.body;
        const updated = await mentor_deatils_model_1.default.findByIdAndUpdate(id, updates, { new: true }).exec();
        if (!updated)
            return res.status(404).json({ message: "Mentor not found" });
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updateMentorDetails = updateMentorDetails;
// ---------------------- DELETE ----------------------
const deleteMentorDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await mentor_deatils_model_1.default.findByIdAndDelete(id).exec();
        if (!deleted)
            return res.status(404).json({ message: "Mentor not found" });
        res.status(200).json({ message: "Mentor details deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteMentorDetails = deleteMentorDetails;
