"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkills = exports.createSkills = exports.fetchSkills = void 0;
// @ts-nocheck
const skills_model_1 = __importDefault(require("./skills.model"));
const fetchSkills = async (req, res) => {
    try {
        const skills = await skills_model_1.default.find();
        return res.json(skills);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to fetch Skills!" });
    }
};
exports.fetchSkills = fetchSkills;
const createSkills = async (req, res) => {
    try {
        const skills = new skills_model_1.default(req.body);
        await skills.save();
        return res.json(skills);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to create Skills!" });
    }
};
exports.createSkills = createSkills;
const deleteSkills = async (req, res) => {
    try {
        console.log("Delete skills......");
        const skills = await skills_model_1.default.findByIdAndDelete(req.params.id);
        if (!skills)
            return res.status(404).json({ message: "SKills is not found" });
        return res.json({ message: "Skills deleted successfully." });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to fetch Skills!" });
    }
};
exports.deleteSkills = deleteSkills;
