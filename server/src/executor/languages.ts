export interface LanguageConfig {
  key: string;
  image: string;
  sourceFileName: string;
  compileCommand?: string;
  runCommand: string;
}

const languageConfigs: Record<number, LanguageConfig> = {
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

export const getLanguageConfig = (languageId: number): LanguageConfig | null => {
  return languageConfigs[languageId] ?? null;
};

export const getSupportedLanguages = () => {
  return Object.entries(languageConfigs).map(([languageId, config]) => ({
    languageId: Number(languageId),
    key: config.key,
    image: config.image,
  }));
};
