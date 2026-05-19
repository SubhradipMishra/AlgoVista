"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopics = exports.createTopics = exports.fetchTopics = void 0;
const topics_model_1 = __importDefault(require("./topics.model"));
const fetchTopics = async (req, res) => {
    try {
        console.log("fetch topics");
        const topics = await topics_model_1.default.find();
        return res.json(topics);
    }
    catch (err) {
        return res.status(500).json(err);
    }
};
exports.fetchTopics = fetchTopics;
const createTopics = async (req, res) => {
    try {
        const newTopic = new topics_model_1.default(req.body);
        await newTopic.save();
        res.json({ message: "Topics Created Successfully!" });
    }
    catch (err) {
        return res.status(500).json(err);
    }
};
exports.createTopics = createTopics;
const deleteTopics = async (req, res) => {
    try {
        console.log("Delete topics.....");
        const topics = await topics_model_1.default.findByIdAndDelete(req.params.id);
        if (!topics)
            return res.status(404).json({ message: "Topics is not found!" });
        res.json({ message: "Topics delete Successfully!" });
    }
    catch (err) {
        return res.status(500).json(err);
    }
};
exports.deleteTopics = deleteTopics;
