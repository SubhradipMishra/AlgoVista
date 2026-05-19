"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportedLanguages = exports.getLanguageConfig = void 0;
const languageConfigs = {
    54: {
        key: "cpp",
        image: "gcc:13",
        sourceFileName: "main.cpp",
        compileCommand: "g++ main.cpp -O2 -std=c++17 -o main",
        runCommand: "./main",
    },
    63: {
        key: "javascript",
        image: "node:20-alpine",
        sourceFileName: "main.js",
        runCommand: "node main.js",
    },
    71: {
        key: "python",
        image: "python:3.11-alpine",
        sourceFileName: "main.py",
        runCommand: "python3 main.py",
    },
};
const getLanguageConfig = (languageId) => {
    return languageConfigs[languageId] ?? null;
};
exports.getLanguageConfig = getLanguageConfig;
const getSupportedLanguages = () => {
    return Object.entries(languageConfigs).map(([languageId, config]) => ({
        languageId: Number(languageId),
        key: config.key,
        image: config.image,
    }));
};
exports.getSupportedLanguages = getSupportedLanguages;
