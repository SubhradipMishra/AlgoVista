"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSuccessStory = exports.deleteSuccessStory = exports.createSuccessStory = exports.fetchSuccessStoriesByMentorEmail = exports.fetchSuccessStory = void 0;
const success_story_model_1 = __importDefault(require("./success-story.model"));
// ✅ Fetch all success stories
const fetchSuccessStory = async (req, res) => {
    try {
        const successStories = await success_story_model_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json(successStories);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch success stories!" });
    }
};
exports.fetchSuccessStory = fetchSuccessStory;
// ✅ Fetch stories by mentor email
const fetchSuccessStoriesByMentorEmail = async (req, res) => {
    try {
        const mentorEmail = req.user.email;
        if (!mentorEmail) {
            return res.status(400).json({ message: "Mentor email is required!" });
        }
        const stories = await success_story_model_1.default.find({ mentorEmail: mentorEmail.toLowerCase() }).sort({
            createdAt: -1,
        });
        if (!stories.length) {
            return res.status(404).json({ message: "No success stories found for this mentor!" });
        }
        return res.status(200).json({ count: stories.length, data: stories });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to fetch success stories for mentor!",
            error: err.message,
        });
    }
};
exports.fetchSuccessStoriesByMentorEmail = fetchSuccessStoriesByMentorEmail;
// ✅ Create new success story (Admin only)
const createSuccessStory = async (req, res) => {
    try {
        console.log(req.body);
        const newSuccessStory = new success_story_model_1.default(req.body);
        await newSuccessStory.save();
        return res.status(201).json({
            message: "Success story created successfully!",
            successStory: newSuccessStory,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create success story!", error: err.message });
    }
};
exports.createSuccessStory = createSuccessStory;
// ✅ Delete success story (Admin only)
const deleteSuccessStory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStory = await success_story_model_1.default.findByIdAndDelete(id);
        if (!deletedStory) {
            return res.status(404).json({ message: "Success story not found!" });
        }
        return res.status(200).json({
            message: "Success story deleted successfully!",
            deletedStory,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to delete success story!",
            error: err.message,
        });
    }
};
exports.deleteSuccessStory = deleteSuccessStory;
// ✅ Update success story (Admin only)
const updateSuccessStory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedStory = await success_story_model_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedStory) {
            return res.status(404).json({ message: "Success story not found!" });
        }
        return res.status(200).json({
            message: "Success story updated successfully!",
            updatedStory,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to update success story!",
            error: err.message,
        });
    }
};
exports.updateSuccessStory = updateSuccessStory;
