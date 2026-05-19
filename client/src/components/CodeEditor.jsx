// CodeEditor.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Button,
  Tabs,
  Badge,
  Statistic,
  Row,
  Col,
  Tooltip,
  Switch,
} from "antd";
import { Star } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Context from "../util/context";

const { TabPane } = Tabs;

/**
 * Improved CodeEditor with Black + White theme.
 * - Option B style: same behavior, cleaned up, polished UI.
 * - Expects existing API endpoints used in original file.
 */

export default function CodeEditor() {
  const { id } = useParams();
  const { session } = useContext(Context);
  const languageId = 54;

  // loading & data
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // editor & code
  const [editorTheme, setEditorTheme] = useState("vs-dark"); // default dark
  const [code, setCode] = useState(() => localStorage.getItem(`code_${id}`) || "");
  const [showHint, setShowHint] = useState(false);

  // submissions/output
  const [output, setOutput] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  // tabs
  const [tabKey, setTabKey] = useState("description");

  // summary
  const summaryStats = useMemo(() => {
    return {
      total: output.length,
      accepted: output.filter((r) => (r.status || "").toLowerCase() === "accepted")
        .length,
      failed: output.filter((r) => (r.status || "").toLowerCase() !== "accepted")
        .length,
      fastest: output.length ? Math.min(...output.map((r) => +r.time || 99999)) : 0,
    };
  }, [output]);

  const outputSummary = useMemo(() => {
    if (summaryStats.total === 0) {
      return {
        label: "No test results yet",
        tone: "#9CA3AF",
      };
    }

    if (summaryStats.accepted === summaryStats.total) {
      return {
        label: `${summaryStats.accepted}/${summaryStats.total} passed`,
        tone: "#FFFFFF",
      };
    }

    return {
      label: `${summaryStats.accepted}/${summaryStats.total} passed`,
      tone: "#FACC15",
    };
  }, [summaryStats]);

  // fetch problem
  useEffect(() => {
    let cancelled = false;
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:4000/problem/${id}`);
        if (cancelled) return;
        setProblem(data.problem || null);

        // load starter code if not present
        if (!localStorage.getItem(`code_${id}`) && data.problem?.starterCode) {
          setCode(data.problem.starterCode);
        }
      } catch (err) {
        console.error("fetchProblem:", err);
        toast.error("Failed to load problem.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) fetchProblem();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // fetch user submissions (non-fatal)
  useEffect(() => {
    const fetchUserSubmissions = async () => {
      if (!session?.id || !id) return;
      try {
        const { data } = await axios.get(
          `http://localhost:4000/submissions/user/${session.id}/problem/${id}`
        );
        setUserSubmissions(data.submissions || []);
      } catch (err) {
        // silently ignore
        console.log("No previous submissions or failed to fetch");
      }
    };
    fetchUserSubmissions();
  }, [id, session]);

  // autosave code locally
  useEffect(() => {
    localStorage.setItem(`code_${id}`, code);
  }, [code, id]);

  // toggle favorite helper (keeps in localStorage)
  const toggleFavoriteLocal = (pid) => {
    try {
      const raw = localStorage.getItem("fav_problems_v1") || "{}";
      const fav = JSON.parse(raw);
      if (fav[pid]) delete fav[pid];
      else fav[pid] = true;
      localStorage.setItem("fav_problems_v1", JSON.stringify(fav));
      toast.info(fav[pid] ? "Added to favorites" : "Removed from favorites");
    } catch {
      // noop
    }
  };

  // submit code (C++ - language_id 54)
  const handleSubmit = async () => {
    if (!code || code.trim() === "") {
      toast.warn("Please write some code before submitting.");
      return;
    }

    // show compiling placeholder
    setOutput([{ id: 0, status: "Compiling...", color: "#FFFFFF", input: "", output: "", expected: "" }]);
    setTabKey("output");
    toast.info("Submitting...");

    try {
      toast.info("Preparing Docker runtime...");
      await axios.post("http://localhost:4000/submissions/prewarm", {
        language_id: languageId,
      });

      const { data } = await axios.post("http://localhost:4000/submissions", {
        source_code: code,
        language_id: languageId, // C++
        problemId: id,
        userId: session?.id,
      });

      const results = (data.submission?.results || []).map((r, idx) => ({
        ...r,
        id: idx + 1,
        color: (r.status || "").toLowerCase() === "accepted" ? "#FFFFFF" : "#CCCCCC",
      }));

      setOutput(results);
      toast.success(`Submission finished · ${data.submission?.verdict || "Done"}`);

      // optimistic add to user's submissions
      if (data.submission) {
        setUserSubmissions((prev) => [data.submission, ...prev]);
      }
    } catch (err) {
      console.error("submit:", err);
      const msg = err.response?.data?.error || "Submission failed";
      toast.error(msg);
      setOutput([]);
    }
  };

  // helper download code
  const downloadCode = () => {
    try {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(problem?.title || "solution").replace(/\s+/g, "_")}.cpp`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (err) {
      toast.error("Download failed");
    }
  };


  // UI: loading / not found
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
        <div className="text-lg">Loading problem...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
        <div className="text-lg">Problem not found</div>
      </div>
    );
  }

  // difficulty badge classes
  const difficultyBadgeStyle = (d) => {
    const diff = (d || "").toLowerCase();
    if (diff === "easy") return "text-green-400 bg-green-950/20 border-green-900/30";
    if (diff === "medium") return "text-amber-400 bg-amber-950/20 border-amber-900/30";
    return "text-red-400 bg-red-950/20 border-red-900/30";
  };

  // main render
  return (
    <div className="min-h-screen flex w-full bg-black text-gray-200 font-mono relative overflow-hidden">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.015)] rounded-full blur-[140px] pointer-events-none"></div>
      
      <ToastContainer position="top-right" newestOnTop theme="dark" />

      {/* LEFT PANEL */}
      <aside
        className="w-[38%] h-screen sticky top-0 overflow-y-auto p-6 border-r border-gray-900 bg-[#030303]/90 backdrop-blur-md relative z-10"
      >
        {/* header card */}
        <div className="relative rounded-2xl p-5 bg-[#07070a] border border-[rgba(250,204,21,0.15)] mb-5 overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
          <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[var(--primary)] opacity-40"></div>
          
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-1">◈ Algorithmic Sandbox</div>
              <h1 className="text-xl font-black text-white leading-tight uppercase tracking-wider">
                {problem.title}
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 font-mono">{problem._id}</p>
            </div>

            <div className="text-right">
              <span className={`text-[9px] font-black px-2 py-0.5 border rounded uppercase tracking-widest ${difficultyBadgeStyle(problem.difficulty)}`}>
                {problem.difficulty || "EASY"}
              </span>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-2">
                {problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : ""}
              </div>
            </div>
          </div>

          {/* meta row */}
          <div className="mt-5 flex items-center justify-between border-t border-gray-900/60 pt-4">
            <button
              onClick={() => toggleFavoriteLocal(problem._id)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--primary)] transition-colors bg-black border border-gray-900 px-3 py-1 rounded"
            >
              <Star size={11} className="text-amber-400" />
              <span>Favorite</span>
            </button>

            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {problem.solvedCount ? `${problem.solvedCount} Solved Successfully` : ""}
            </span>
          </div>
        </div>

        {/* tags & companies & hints */}
        <div className="rounded-2xl p-5 bg-[#07070a] border border-gray-900 mb-5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Topic Tags</h4>
          <div className="flex gap-1.5 flex-wrap mb-5">
            {(problem.tags && problem.tags.length ? problem.tags : ["General"]).map((t) => (
              <span
                key={t}
                className="text-[9px] font-black uppercase tracking-wider text-amber-300/85 bg-black border border-[rgba(250,204,21,0.15)] px-2.5 py-0.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>

          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Featured In</h4>
          <div className="flex gap-1.5 flex-wrap mb-5">
            {(problem.company && problem.company.length ? problem.company : ["General Challenges"]).map((c) => (
              <span
                key={c}
                className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-black border border-gray-900 px-2.5 py-0.5 rounded"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="border-t border-gray-900/60 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reveal Hint</h4>
              <Switch
                checked={showHint}
                onChange={(v) => setShowHint(v)}
                size="small"
                style={{ background: showHint ? "var(--primary)" : undefined }}
              />
            </div>
            {showHint && (
              <div className="mt-3 text-xs text-gray-400 leading-relaxed font-semibold">
                {problem.hints || "No hint is available for this challenge."}
              </div>
            )}
          </div>
        </div>

        {/* Description + Constraints Tabs */}
        <div className="mt-5">
          <Tabs
            activeKey={tabKey}
            onChange={setTabKey}
            centered={false}
          >
            <TabPane tab="Problem" key="description">
              <div className="rounded-2xl p-5 bg-[#07070a] border border-gray-900 mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Description</h4>
                <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {problem.description || "No description available."}
                </div>
              </div>

              <div className="rounded-2xl p-5 bg-[#07070a] border border-gray-900">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Constraints</h4>
                <div className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
                  {problem.constraints || "No constraints specified."}
                </div>
              </div>
            </TabPane>

            <TabPane tab="Submissions" key="submissions">
              <div className="space-y-3">
                {userSubmissions.length === 0 ? (
                  <div className="rounded-2xl p-6 border border-dashed border-gray-900 bg-black/40 text-center text-xs font-bold uppercase tracking-widest text-gray-600">
                    No submissions found.
                  </div>
                ) : (
                  userSubmissions.map((sub) => {
                    const isAccepted = (sub.verdict || "").toLowerCase() === "accepted";
                    return (
                      <div
                        key={sub._id}
                        className={`rounded-xl p-4 bg-[#07070a] border transition-all duration-300
                          ${
                            isAccepted
                              ? "border-green-900/30 hover:border-green-500/50"
                              : "border-red-900/30 hover:border-red-500/50"
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`text-xs font-black uppercase tracking-wider ${isAccepted ? "text-green-400" : "text-red-400"}`}>
                              {sub.verdict || "UNKNOWN"}
                            </div>
                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">{new Date(sub.createdAt).toLocaleString()}</div>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() =>
                                setExpandedSubmission((prev) => (prev === sub._id ? null : sub._id))
                              }
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-black border border-gray-800 text-gray-400 hover:text-white rounded"
                            >
                              {expandedSubmission === sub._id ? "Hide" : "View"}
                            </button>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sub.source_code || "");
                                toast.success("Copied submission code");
                              }}
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-black border border-gray-800 text-gray-400 hover:text-white rounded"
                            >
                              Copy
                            </button>

                            <button
                              onClick={() => {
                                setCode(sub.source_code || "");
                                toast.success("Loaded submission into editor");
                              }}
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-[var(--primary)] text-black rounded"
                            >
                              Load
                            </button>
                          </div>
                        </div>

                        {expandedSubmission === sub._id && (
                          <div className="mt-3 border-t border-gray-900 pt-3">
                            <MonacoEditor
                              height="160px"
                              language="cpp"
                              theme="vs-dark"
                              value={sub.source_code || ""}
                              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 11 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </TabPane>

            <TabPane tab="Test Results" key="output">
              <div className="space-y-4">
                {output.length > 0 && (
                  <div className="rounded-2xl p-5 border border-[rgba(250,204,21,0.15)] bg-[#07070a]">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div
                          className="text-xl font-black uppercase tracking-wider"
                          style={{ color: outputSummary.tone }}
                        >
                          {outputSummary.label}
                        </div>
                        <div className="mt-1.5 text-xs text-gray-400 leading-relaxed font-semibold">
                          {summaryStats.failed === 0
                            ? "All visible test cases completed successfully."
                            : `${summaryStats.failed} test case${summaryStats.failed > 1 ? "s" : ""} failed or timed out.`}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="rounded bg-green-950/20 border border-green-900/30 text-green-400 px-2.5 py-1">
                          Passed: {summaryStats.accepted}
                        </span>
                        <span className="rounded bg-red-950/20 border border-red-900/30 text-red-400 px-2.5 py-1">
                          Failed: {summaryStats.failed}
                        </span>
                        <span className="rounded bg-black border border-gray-900 text-gray-400 px-2.5 py-1">
                          Fastest: {summaryStats.fastest ? `${summaryStats.fastest} s` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {output.length === 0 ? (
                  <div className="rounded-2xl p-6 border border-dashed border-gray-900 bg-black/40 text-center text-xs font-bold uppercase tracking-widest text-gray-600">
                    No run executed yet.
                  </div>
                ) : (
                  output.map((res) => {
                    const isOk = (res.status || "").toLowerCase() === "accepted";
                    return (
                      <div
                        key={res.id}
                        className={`rounded-xl p-4 bg-[#07070a] border transition-all duration-300
                          ${
                            isOk
                              ? "border-green-900/30"
                              : "border-red-900/30"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`text-xs font-black uppercase tracking-wider ${isOk ? "text-green-400" : "text-red-400"}`}>
                            {res.status} · Test Case {res.id}
                          </div>
                          {res.time && <div className="text-[10px] text-gray-500 font-bold font-mono">{res.time} s</div>}
                        </div>

                        {res.id !== 0 && (
                          <div className="mt-3 text-xs font-semibold text-gray-400 space-y-1.5 font-mono border-t border-gray-900/50 pt-2.5">
                            <div><strong className="text-gray-500">Input:</strong> <span className="text-gray-300 break-words">{res.input}</span></div>
                            <div><strong className="text-gray-500">Output:</strong> <span className="text-gray-300 break-words">{res.output}</span></div>
                            <div><strong className="text-gray-500">Expected:</strong> <span className="text-gray-300 break-words">{res.expected}</span></div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </TabPane>
          </Tabs>
        </div>
      </aside>

      {/* RIGHT PANEL (Editor) */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col justify-between relative z-10 bg-black">
        <div>
          {/* top controls */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-900">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[var(--primary)] text-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all duration-300"
              >
                🚀 Run & Submit (C++)
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  toast.success("Code copied successfully");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-black border border-gray-900 text-gray-400 hover:text-white transition-colors"
              >
                📋 Copy Code
              </button>

              <button 
                onClick={downloadCode} 
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-black border border-gray-900 text-gray-400 hover:text-white transition-colors"
              >
                ⬇ Download Solution
              </button>

              <button
                onClick={() => {
                  setCode(problem.starterCode || "");
                  toast.info("Reset to starter template code");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-black border border-gray-900 text-red-500 hover:bg-red-950/20 transition-colors"
              >
                🔄 Reset Template
              </button>
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Docker Sandbox Active
            </div>
          </div>

          {/* editor container */}
          <div className="rounded-2xl overflow-hidden border border-gray-900 bg-black min-h-[500px]">
            <MonacoEditor
              height="600px"
              language="cpp"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                automaticLayout: true,
                fontSize: 13,
                fontFamily: "monospace",
                minimap: { enabled: false },
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
              }}
            />
          </div>
        </div>

        {/* summary stats at bottom */}
        <div className="mt-6 border-t border-gray-950 pt-6">
          <Row gutter={16}>
            <Col span={6}>
              <div className="relative rounded-2xl p-4 bg-[#07070a]/90 border border-gray-900 overflow-hidden group">
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[var(--primary)] opacity-30"></div>
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Executions</div>
                <div className="text-xl font-black text-white font-mono">{summaryStats.total}</div>
              </div>
            </Col>

            <Col span={6}>
              <div className="relative rounded-2xl p-4 bg-[#07070a]/90 border border-gray-900 overflow-hidden group">
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-green-400 opacity-30"></div>
                <div className="text-[9px] font-black uppercase tracking-widest text-green-500 mb-1">Accepted Passed</div>
                <div className="text-xl font-black text-green-400 font-mono">{summaryStats.accepted}</div>
              </div>
            </Col>

            <Col span={6}>
              <div className="relative rounded-2xl p-4 bg-[#07070a]/90 border border-gray-900 overflow-hidden group">
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-red-400 opacity-30"></div>
                <div className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Failed Cases</div>
                <div className="text-xl font-black text-red-400 font-mono">{summaryStats.failed}</div>
              </div>
            </Col>

            <Col span={6}>
              <div className="relative rounded-2xl p-4 bg-[#07070a]/90 border border-gray-900 overflow-hidden group">
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-amber-400 opacity-30"></div>
                <div className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Fastest Compile</div>
                <div className="text-xl font-black text-amber-400 font-mono">
                  {summaryStats.fastest ? `${summaryStats.fastest}s` : "-"}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
}
