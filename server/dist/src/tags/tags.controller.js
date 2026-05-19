"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTags = exports.deleteTags = exports.fetchTags = void 0;
const tags_model_1 = __importDefault(require("./tags.model"));
const fetchTags = async (req, res) => {
    try {
        const tags = await tags_model_1.default.find();
        return res.json(tags);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch tags" });
    }
};
exports.fetchTags = fetchTags;
const deleteTags = async (req, res) => {
    try {
        const tag = await tags_model_1.default.findByIdAndDelete(req.params.id);
        if (!tag)
            return res.status(500).json({ message: "Tag is not found!" });
        return res.status(200).json({ message: "Tag delete successfully!" });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to delete tag!" });
    }
};
exports.deleteTags = deleteTags;
const createTags = async (req, res) => {
    try {
        const newTags = new tags_model_1.default(req.body);
        await newTags.save();
        res.json({ message: "Tags Created Successfully!" });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to Create Tags!" });
    }
};
exports.createTags = createTags;
