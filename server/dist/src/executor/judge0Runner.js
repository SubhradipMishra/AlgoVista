"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSubmissionInJudge0 = exports.prewarmJudge0Image = exports.checkJudge0Health = void 0;
const JUDGE0_BASE_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_HOST = process.env.JUDGE0_HOST || "";
const getHeaders = () => {
    const headers = {
        "Content-Type": "application/json",
    };
    if (JUDGE0_API_KEY) {
        headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    }
    if (JUDGE0_HOST) {
        headers["X-RapidAPI-Host"] = JUDGE0_HOST;
    }
    return headers;
};
const checkJudge0Health = async () => {
    try {
        // A simple request to check if the Judge0 API is reachable
        const response = await fetch(`${JUDGE0_BASE_URL}/languages`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Judge0 API error: ${response.status} ${response.statusText}`);
        }
        const languages = await response.json();
        return {
            ok: true,
            judge0Version: "Unknown", // Assuming ce.judge0.com
            supportedLanguages: languages,
        };
    }
    catch (error) {
        throw new Error(`Judge0 daemon is not available: ${error.message}`);
    }
};
exports.checkJudge0Health = checkJudge0Health;
const prewarmJudge0Image = async (languageId) => {
    // Judge0 doesn't need prewarming in the same way docker does
    return {
        ok: true,
        languageId,
        pulled: true,
        availableLocally: true,
    };
};
exports.prewarmJudge0Image = prewarmJudge0Image;
const executeSubmissionInJudge0 = async ({ languageId, sourceCode, testCases, }) => {
    const results = [];
    for (const testCase of testCases) {
        // 1. Create a submission
        const createResponse = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                language_id: languageId,
                source_code: sourceCode,
                stdin: testCase.input,
                expected_output: testCase.expectedOutput,
            }),
        });
        if (!createResponse.ok) {
            throw new Error(`Failed to create submission: ${createResponse.statusText}`);
        }
        const data = await createResponse.json();
        // Mapping Judge0 status to our statuses
        // Judge0 status IDs:
        // 3: Accepted
        // 4: Wrong Answer
        // 5: Time Limit Exceeded
        // 6: Compilation Error
        // 7-12: Runtime Error
        let status = "Accepted";
        let output = (data.stdout || data.stderr || data.compile_output || "").trim();
        const expected = (testCase.expectedOutput || "").trim();
        if (data.status?.id === 3) {
            status = "Accepted";
        }
        else if (data.status?.id === 4) {
            status = "Wrong Answer";
        }
        else if (data.status?.id === 5) {
            status = "Time Limit";
        }
        else if (data.status?.id === 6) {
            status = "Compile Error";
        }
        else if (data.status?.id >= 7 && data.status?.id <= 12) {
            status = "Runtime Error";
        }
        else {
            status = data.status?.description || "Error";
        }
        results.push({
            input: testCase.input,
            expected: expected,
            output: output,
            status: status,
            time: data.time || "0",
            memory: data.memory || 0,
        });
    }
    return results;
};
exports.executeSubmissionInJudge0 = executeSubmissionInJudge0;
