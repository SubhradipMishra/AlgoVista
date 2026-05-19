"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoadmap = exports.updateRoadmap = exports.getRoadmapById = exports.getAllRoadmaps = exports.createRoadmap = void 0;
const roadmap_model_1 = __importDefault(require("./roadmap.model"));
/**
 * @desc Create a new roadmap module
 * @route POST /api/roadmap
 * @access Admin
 */
const createRoadmap = async (req, res) => {
    try {
        // Inject createdBy from logged-in user
        const roadmap = new roadmap_model_1.default({
            ...req.body,
            createdBy: req.user._id, // <-- automatically injected
        });
        const savedRoadmap = await roadmap.save();
        res.status(201).json({
            success: true,
            message: "Roadmap module created successfully",
            data: savedRoadmap,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Error creating roadmap module",
        });
    }
};
exports.createRoadmap = createRoadmap;
/**
 * @desc Get all roadmap modules (sorted by order)
 * @route GET /api/roadmap
 * @access Public
 */
const getAllRoadmaps = async (req, res) => {
    try {
        const roadmaps = await roadmap_model_1.default.find().sort({ order: 1 });
        res.status(200).json({
            success: true,
            count: roadmaps.length,
            data: roadmaps,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching roadmap data",
        });
    }
};
exports.getAllRoadmaps = getAllRoadmaps;
/**
 * @desc Get a single roadmap module by ID
 * @route GET /api/roadmap/:id
 * @access Public
 */
const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await roadmap_model_1.default.findById(req.params.id);
        if (!roadmap) {
            return res.status(404).json({ success: false, message: "Roadmap not found" });
        }
        res.status(200).json({ success: true, data: roadmap });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching roadmap module",
        });
    }
};
exports.getRoadmapById = getRoadmapById;
/**
 * @desc Update a roadmap module
 * @route PUT /api/roadmap/:id
 * @access Admin
 */
const updateRoadmap = async (req, res) => {
    try {
        const updated = await roadmap_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Roadmap not found" });
        }
        res.status(200).json({
            success: true,
            message: "Roadmap module updated successfully",
            data: updated,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Error updating roadmap module",
        });
    }
};
exports.updateRoadmap = updateRoadmap;
/**
 * @desc Delete a roadmap module
 * @route DELETE roadmap/:id
 * @access Admin
 */
const deleteRoadmap = (req, res) => {
    console.log("DELETE");
};
exports.deleteRoadmap = deleteRoadmap;
