"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TagsRouter = express_1.default.Router();
const tags_controller_1 = require("./tags.controller");
TagsRouter.get('/', tags_controller_1.fetchTags);
TagsRouter.post("/", tags_controller_1.createTags);
TagsRouter.delete("/:id", tags_controller_1.deleteTags);
exports.default = TagsRouter;
