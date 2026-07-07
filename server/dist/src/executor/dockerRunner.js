"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSubmissionInDocker = exports.checkDockerExecutorHealth = exports.prewarmDockerImage = void 0;
// @ts-nocheck
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const languages_1 = require("./languages");
const DOCKER_BIN = process.env.DOCKER_BIN || "docker";
const EXECUTION_TIMEOUT_MS = Number(process.env.CODE_RUN_TIMEOUT_MS || 5000);
const COMPILATION_TIMEOUT_MS = Number(process.env.CODE_COMPILE_TIMEOUT_MS || 30000);
const IMAGE_PULL_TIMEOUT_MS = Number(process.env.CODE_PULL_TIMEOUT_MS || 300000);
const MEMORY_LIMIT = process.env.CODE_RUN_MEMORY || "256m";
const CPU_LIMIT = process.env.CODE_RUN_CPUS || "0.5";
const PIDS_LIMIT = process.env.CODE_RUN_PIDS || "64";
const TMPFS_CONFIG = process.env.CODE_RUN_TMPFS || "/tmp:rw,size=64m";
const normalizeOutput = (value) => {
    return (value || "").replace(/\r\n/g, "\n").trim();
};
const formatErrorOutput = (stderr, stdout) => {
    return normalizeOutput(stderr) || normalizeOutput(stdout);
};
const runCommand = async (command, args) => {
    return await new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        const child = (0, child_process_1.spawn)(command, args, {
            stdio: ["ignore", "pipe", "pipe"],
        });
        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", (error) => {
            if (error.code === "ENOENT") {
                reject(new Error("Docker CLI not found. Install Docker and make sure the docker command is available."));
                return;
            }
            reject(error);
        });
        child.on("close", (code) => {
            resolve({ code, stdout, stderr });
        });
    });
};
const killContainer = async (containerName) => {
    await new Promise((resolve) => {
        const killer = (0, child_process_1.spawn)(DOCKER_BIN, ["kill", containerName], {
            stdio: "ignore",
        });
        killer.on("close", () => resolve());
        killer.on("error", () => resolve());
    });
};
const runCommandWithTimeout = async (command, args, timeoutMs) => {
    return await new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        let settled = false;
        let timedOut = false;
        const child = (0, child_process_1.spawn)(command, args, {
            stdio: ["ignore", "pipe", "pipe"],
        });
        const finish = (result) => {
            if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve(result);
            }
        };
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill();
        }, timeoutMs);
        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", (error) => {
            clearTimeout(timer);
            if (error.code === "ENOENT") {
                reject(new Error("Docker CLI not found. Install Docker and make sure the docker command is available."));
                return;
            }
            reject(error);
        });
        child.on("close", (code) => {
            finish({ code, stdout, stderr, timedOut });
        });
    });
};
const inspectDockerImage = async (image) => {
    const inspectResult = await runCommand(DOCKER_BIN, ["image", "inspect", image]);
    return (inspectResult.code ?? 1) === 0;
};
const ensureDockerImageAvailable = async (image) => {
    const imageExists = await inspectDockerImage(image);
    if (imageExists) {
        return { image, pulled: false };
    }
    const pullResult = await runCommandWithTimeout(DOCKER_BIN, ["pull", image], IMAGE_PULL_TIMEOUT_MS);
    if (pullResult.timedOut) {
        throw new Error(`Timed out while pulling Docker image: ${image}`);
    }
    if ((pullResult.code ?? 1) !== 0) {
        throw new Error(formatErrorOutput(pullResult.stderr, pullResult.stdout) || `Failed to pull Docker image: ${image}`);
    }
    return { image, pulled: true };
};
const prewarmDockerImage = async (languageId) => {
    const language = (0, languages_1.getLanguageConfig)(languageId);
    if (!language) {
        throw new Error(`Unsupported language_id: ${languageId}`);
    }
    const result = await ensureDockerImageAvailable(language.image);
    return {
        ok: true,
        languageId,
        key: language.key,
        image: language.image,
        pulled: result.pulled,
        availableLocally: true,
    };
};
exports.prewarmDockerImage = prewarmDockerImage;
const runDockerCommand = async ({ workspaceDir, image, command, timeoutMs, }) => {
    const containerName = `algovista-run-${(0, crypto_1.randomUUID)()}`;
    return await new Promise((resolve, reject) => {
        const args = [
            "run",
            "--rm",
            "--name",
            containerName,
            "--network",
            "none",
            "--memory",
            MEMORY_LIMIT,
            "--cpus",
            CPU_LIMIT,
            "--pids-limit",
            PIDS_LIMIT,
            "--security-opt",
            "no-new-privileges",
            "--cap-drop",
            "ALL",
            "--read-only",
            "--tmpfs",
            TMPFS_CONFIG,
            "-v",
            `${workspaceDir}:/workspace`,
            "-w",
            "/workspace",
            image,
            "sh",
            "-lc",
            command,
        ];
        const startedAt = Date.now();
        let stdout = "";
        let stderr = "";
        let settled = false;
        let timedOut = false;
        const child = (0, child_process_1.spawn)(DOCKER_BIN, args, {
            stdio: ["ignore", "pipe", "pipe"],
        });
        const finish = (result) => {
            if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve(result);
            }
        };
        const timer = setTimeout(async () => {
            timedOut = true;
            await killContainer(containerName);
            child.kill();
        }, timeoutMs);
        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", (error) => {
            clearTimeout(timer);
            if (error.code === "ENOENT") {
                reject(new Error("Docker CLI not found. Install Docker and make sure the docker command is available."));
                return;
            }
            reject(error);
        });
        child.on("close", (code) => {
            finish({
                code,
                stdout,
                stderr,
                timedOut,
                elapsedSeconds: ((Date.now() - startedAt) / 1000).toFixed(3),
            });
        });
    });
};
const checkDockerExecutorHealth = async () => {
    const versionResult = await runCommand(DOCKER_BIN, ["version", "--format", "{{.Server.Version}}"]);
    if ((versionResult.code ?? 1) !== 0) {
        throw new Error(formatErrorOutput(versionResult.stderr, versionResult.stdout) || "Docker daemon is not available.");
    }
    const supportedLanguages = (0, languages_1.getSupportedLanguages)();
    const imageStatuses = await Promise.all(supportedLanguages.map(async (language) => ({
        ...language,
        availableLocally: await inspectDockerImage(language.image),
    })));
    return {
        ok: true,
        dockerVersion: normalizeOutput(versionResult.stdout),
        supportedLanguages: imageStatuses,
        limits: {
            executionTimeoutMs: EXECUTION_TIMEOUT_MS,
            compilationTimeoutMs: COMPILATION_TIMEOUT_MS,
            imagePullTimeoutMs: IMAGE_PULL_TIMEOUT_MS,
            memory: MEMORY_LIMIT,
            cpus: CPU_LIMIT,
            pidsLimit: PIDS_LIMIT,
            tmpfs: TMPFS_CONFIG,
        },
    };
};
exports.checkDockerExecutorHealth = checkDockerExecutorHealth;
const executeSubmissionInDocker = async ({ languageId, sourceCode, testCases, }) => {
    const language = (0, languages_1.getLanguageConfig)(languageId);
    if (!language) {
        throw new Error(`Unsupported language_id: ${languageId}`);
    }
    await ensureDockerImageAvailable(language.image);
    const workspaceDir = path_1.default.join(os_1.default.tmpdir(), "algovista-executor", (0, crypto_1.randomUUID)());
    await fs_1.promises.mkdir(workspaceDir, { recursive: true });
    try {
        await fs_1.promises.writeFile(path_1.default.join(workspaceDir, language.sourceFileName), sourceCode, "utf8");
        if (language.compileCommand) {
            const compileResult = await runDockerCommand({
                workspaceDir,
                image: language.image,
                command: language.compileCommand,
                timeoutMs: COMPILATION_TIMEOUT_MS,
            });
            if (compileResult.timedOut || compileResult.code !== 0) {
                const compileOutput = compileResult.timedOut
                    ? "Compilation timed out."
                    : formatErrorOutput(compileResult.stderr, compileResult.stdout);
                return testCases.map((tc) => ({
                    input: tc.input,
                    expected: normalizeOutput(tc.expectedOutput),
                    output: compileOutput,
                    status: "Compile Error",
                    time: compileResult.elapsedSeconds,
                    memory: 0,
                }));
            }
        }
        const results = [];
        for (const testCase of testCases) {
            await fs_1.promises.writeFile(path_1.default.join(workspaceDir, "input.txt"), testCase.input || "", "utf8");
            const execution = await runDockerCommand({
                workspaceDir,
                image: language.image,
                command: `${language.runCommand} < input.txt`,
                timeoutMs: EXECUTION_TIMEOUT_MS,
            });
            const expected = normalizeOutput(testCase.expectedOutput);
            const stdout = normalizeOutput(execution.stdout);
            const stderr = formatErrorOutput(execution.stderr, execution.stdout);
            let status = "Accepted";
            let output = stdout;
            if (execution.timedOut) {
                status = "Time Limit";
                output = "Execution timed out.";
            }
            else if ((execution.code ?? 0) !== 0) {
                status = "Runtime Error";
                output = stderr;
            }
            else if (stdout !== expected) {
                status = "Wrong Answer";
            }
            results.push({
                input: testCase.input,
                expected,
                output,
                status,
                time: execution.elapsedSeconds,
                memory: 0,
            });
        }
        return results;
    }
    finally {
        await fs_1.promises.rm(workspaceDir, { recursive: true, force: true });
    }
};
exports.executeSubmissionInDocker = executeSubmissionInDocker;
