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
      const { data } = await axios.post("http://localhost:4000/submissions", {
        source_code: code,
        language_id: 54, // C++
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

  // difficulty badge color
  const difficultyColor = (d) =>
    (d || "").toLowerCase() === "easy"
      ? "#FFFFFF"
      : (d || "").toLowerCase() === "medium"
      ? "#FFFFFF"
      : "#CCCCCC";

  // main render
  return (
    <div className="min-h-screen flex w-full bg-black text-white font-mono">
      <ToastContainer position="top-right" newestOnTop theme="colored" />

      {/* LEFT PANEL */}
      <aside
        className="w-[34%] h-screen sticky top-0 overflow-y-auto p-5"
        style={{ background: "#000000", borderRight: "1px solid #333333" }}
      >
        {/* header card */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "#111111",
            border: "1px solid #333333",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white leading-tight">
                {problem.title}
              </h1>
              <p className="text-sm text-gray-300 mt-1">{problem._id}</p>
            </div>

            <div className="text-right">
              <Badge
                count={(problem.difficulty || "EASY").toUpperCase()}
                style={{
                  backgroundColor: difficultyColor(problem.difficulty),
                  color: "#000000",
                }}
              />
              <div className="text-xs text-gray-400 mt-2">
                {problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : ""}
              </div>
            </div>
          </div>

          {/* meta row */}
          <div className="mt-4 flex items-center gap-2">
            <Tooltip title="Favorite (local)">
              <Button
                size="small"
                onClick={() => toggleFavoriteLocal(problem._id)}
                className="!bg-[#222222] !border !border-[#555555] !text-white !rounded-md"
              >
                <Star size={14} />&nbsp;Fav
              </Button>
            </Tooltip>

            <span className="ml-2 text-sm text-gray-400">
              {problem.solvedCount ? `${problem.solvedCount} solved` : ""}
            </span>
          </div>
        </div>

        {/* tags & companies & hints */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "#111111",
            border: "1px solid #333333",
          }}
        >
          <h4 className="text-sm text-white font-semibold mb-2">Tags</h4>
          <div className="flex gap-2 flex-wrap">
            {(problem.tags && problem.tags.length ? problem.tags : ["General"]).map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <h4 className="text-sm text-white font-semibold mt-4 mb-2">Companies</h4>
          <div className="flex gap-2 flex-wrap">
            {(problem.company && problem.company.length ? problem.company : ["—"]).map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: "#111111",
                  border: "1px solid #333333",
                  color: "#CCCCCC",
                }}
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm text-white font-semibold">Hint</h4>
              <Switch
                checked={showHint}
                onChange={(v) => setShowHint(v)}
                size="small"
                style={{ background: showHint ? "#FFFFFF" : undefined }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-200">
              {showHint ? (problem.hints || "No hints provided.") : "Toggle to reveal hint."}
            </div>
          </div>
        </div>

        {/* Description + Constraints Tabs */}
        <div className="mt-5">
          <Tabs
            activeKey={tabKey}
            onChange={setTabKey}
            tabBarStyle={{ color: "#FFFFFF" }}
            centered={false}
          >
            <TabPane tab="Description" key="description">
              <div
                className="rounded-xl p-4"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <div className="prose prose-sm text-gray-200 whitespace-pre-wrap">
                  {problem.description || "No description available."}
                </div>
              </div>

              <div
                className="rounded-xl p-4 mt-4"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <h4 className="text-sm text-white font-semibold">Constraints</h4>
                <div className="text-sm text-gray-200 mt-2 whitespace-pre-wrap">
                  {problem.constraints || "No constraints specified."}
                </div>
              </div>
            </TabPane>

            <TabPane tab="Submissions" key="submissions">
              <div>
                {userSubmissions.length === 0 ? (
                  <div
                    className="rounded-xl p-4 text-center text-gray-400"
                    style={{ background: "#111111", border: "1px solid #333333" }}
                  >
                    No submissions yet.
                  </div>
                ) : (
                  userSubmissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="rounded-xl p-3 mb-3"
                      style={{
                        background: "#111111",
                        borderLeft: `4px solid ${
                          (sub.verdict || "").toLowerCase() === "accepted" ? "#FFFFFF" : "#CCCCCC"
                        }`,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">{sub.verdict || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{new Date(sub.createdAt).toLocaleString()}</div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="small"
                            onClick={() =>
                              setExpandedSubmission((prev) => (prev === sub._id ? null : sub._id))
                            }
                            className="!bg-[#222222] !text-white !rounded-md"
                          >
                            {expandedSubmission === sub._id ? "Hide" : "View"}
                          </Button>

                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(sub.source_code || "");
                              toast.success("Copied submission");
                            }}
                            className="!bg-[#222222] !text-gray-200 !rounded-md"
                          >
                            Copy
                          </Button>

                          <Button
                            size="small"
                            onClick={() => {
                              setCode(sub.source_code || "");
                              toast.success("Loaded submission into editor");
                            }}
                            className="!bg-[#222222] !text-white !rounded-md"
                          >
                            Load
                          </Button>
                        </div>
                      </div>

                      {expandedSubmission === sub._id && (
                        <div className="mt-3 border-t pt-3" style={{ borderColor: "#333333" }}>
                          <MonacoEditor
                            height="160px"
                            language="cpp"
                            theme="vs-dark"
                            value={sub.source_code || ""}
                            options={{ readOnly: true, minimap: { enabled: false } }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabPane>

            <TabPane tab="Output" key="output">
              <div className="space-y-3">
                {output.length === 0 ? (
                  <div className="text-center text-gray-400">No output yet.</div>
                ) : (
                  output.map((res) => (
                    <div
                      key={res.id}
                      className="rounded-lg p-3"
                      style={{
                        background: "#111111",
                        borderLeft: `6px solid ${res.color || "#FFFFFF"}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold" style={{ color: res.color }}>
                          {res.status} — Test {res.id}
                        </div>
                        {res.time && <div className="text-sm text-gray-400">{res.time} ms</div>}
                      </div>

                      <div className="mt-2 text-sm text-gray-200">
                        <div><strong>Input:</strong> <span className="break-words">{res.input}</span></div>
                        <div><strong>Output:</strong> <span className="break-words">{res.output}</span></div>
                        <div><strong>Expected:</strong> <span className="break-words">{res.expected}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabPane>
          </Tabs>
        </div>
      </aside>

      {/* RIGHT PANEL (Editor) */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* top controls */}
        <div
          className="flex justify-between items-center mb-4"
          style={{ gap: 12 }}
        >
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              className="!bg-white !text-black !font-semibold !rounded-lg !px-5"
            >
              🚀 Run & Submit (C++)
            </Button>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success("Code copied");
              }}
              className="!bg-[#222222] !text-white !rounded-lg"
            >
              📋 Copy
            </Button>

            <Button onClick={downloadCode} className="!bg-[#222222] !text-white !rounded-lg">
              ⬇ Download
            </Button>

            <Button
              onClick={() => {
                setCode(problem.starterCode || "");
                toast.info("Reset to starter code");
              }}
              className="!bg-[#222222] !text-gray-400 !rounded-lg"
            >
              🔄 Reset
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">Editor Theme</div>
            <Button
              onClick={() => setEditorTheme((t) => (t === "vs-dark" ? "vs" : "vs-dark"))}
              className="!bg-[#222222] !text-white !rounded-md"
            >
              {editorTheme === "vs-dark" ? "Dark" : "Light"}
            </Button>
          </div>
        </div>

        {/* editor card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#111111",
            border: "1px solid #333333",
            minHeight: 520,
          }}
        >
          <MonacoEditor
            height="620px"
            language="cpp"
            theme={editorTheme}
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              automaticLayout: true,
              fontSize: 14,
              fontFamily: "monospace",
              minimap: { enabled: false },
              smoothScrolling: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* summary cards */}
        <div className="mt-6">
          <Row gutter={16}>
            <Col span={6}>
              <Card
                className="rounded-xl"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <Statistic title="Total Tests" value={summaryStats.total} valueStyle={{ color: "#FFFFFF" }} />
              </Card>
            </Col>

            <Col span={6}>
              <Card
                className="rounded-xl"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <Statistic title="Accepted" value={summaryStats.accepted} valueStyle={{ color: "#FFFFFF" }} />
              </Card>
            </Col>

            <Col span={6}>
              <Card
                className="rounded-xl"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <Statistic title="Failed" value={summaryStats.failed} valueStyle={{ color: "#CCCCCC" }} />
              </Card>
            </Col>

            <Col span={6}>
              <Card
                className="rounded-xl"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <Statistic title="Fastest (ms)" value={summaryStats.fastest} valueStyle={{ color: "#FFFFFF" }} />
              </Card>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
}
