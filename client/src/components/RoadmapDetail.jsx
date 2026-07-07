"use client";
import React, { useContext, useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Skeleton,
  Checkbox,
  Progress,
  Collapse,
  Button,
  Avatar,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  HomeOutlined,
  BookOutlined,
  CodeOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import Context from "../util/context";
import { getRoadmapById } from "../util/fetcher";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

/* download helper */
const downloadFile = (url, filename) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export default function RoadmapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState({});
  const [certificate, setCertificate] = useState(null);

  /* fetch roadmap */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRoadmapById(id)
      .then((res) => {
        setRoadmap(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  /* auth guard */
  useEffect(() => {
    if (!session && !sessionLoading) navigate("/login");
  }, [session, sessionLoading, navigate]);

  /* fetch progress */
  useEffect(() => {
    if (!session?.id || !id) return;
    fetch(`${import.meta.env.VITE_API_URL}/progress/${session.id}/${id}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const map = {};
          d.progress?.subtopics?.forEach((s) => {
            map[s.subtopicName] = new Set(
              s.resources.filter((r) => r.completed).map((r) => r.title)
            );
          });
          setProgress(map);
        }
      });
  }, [session, id]);

  /* update progress */
  const handleCheck = async (mod, title, checked) => {
    setProgress((p) => {
      const c = structuredClone(p);
      if (!c[mod]) c[mod] = new Set();
      checked ? c[mod].add(title) : c[mod].delete(title);
      return { ...c };
    });

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/progress/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: session.id,
          roadmapId: id,
          subtopicName: mod,
          resourceTitle: title,
          completed: checked,
        }),
      });
    } catch {
      message.error("Progress update failed");
    }
  };

  const moduleProgress = (m) =>
    Math.round(((progress[m.name]?.size || 0) / m.resources.length) * 100);

  const totalProgress = useMemo(() => {
    if (!roadmap) return 0;
    return Math.round(
      roadmap.subtopics.reduce((a, m) => a + moduleProgress(m), 0) /
        roadmap.subtopics.length
    );
  }, [roadmap, progress]);

  /* certificate */
  const generateCertificate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/certificate/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: session.id,
          roadmapId: id,
          roadmapName: roadmap.moduleTitle,
          userName: session.fullname || session.name,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setCertificate({
          id: d.certificateId,
          fileUrl: `${import.meta.env.VITE_API_URL}${d.fileUrl}`,
        });
      }
    } catch {
      message.error("Certificate error");
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-10 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-3xl space-y-6">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center font-mono">
        <p className="text-xl text-[var(--primary)]">Roadmap not found</p>
        <Link to="/roadmaps" className="mt-4 text-sm text-gray-400 hover:text-white underline">
          Back to Roadmaps
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-28 relative z-10">
        
        {/* Navigation */}
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--primary)] transition-colors mb-8 group"
        >
          <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Roadmaps</span>
        </Link>

        {/* Hero Section */}
        <div className="rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-8 md:p-10 mb-10 shadow-[0_0_50px_rgba(250,204,21,0.03)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(250,204,21,0.03)] rounded-full blur-xl pointer-events-none"></div>
          
          <div className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] text-[var(--primary)] mb-4">
            Curriculum Roadmap
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-4 leading-tight">
            {roadmap.moduleTitle}
          </h2>

          <p className="text-sm md:text-base leading-relaxed text-gray-400 max-w-3xl mb-6">
            {roadmap.description}
          </p>

          {!started ? (
            <button
              onClick={() => setStarted(true)}
              className="btn-yellow text-sm font-semibold py-3 px-8 flex items-center gap-2"
            >
              <PlayCircleOutlined /> Start Learning
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400 tracking-wider uppercase font-semibold">
                <span>Overall Progress</span>
                <span className="text-[var(--primary)]">{totalProgress}%</span>
              </div>
              
              <div className="w-full h-2.5 rounded-full bg-gray-900 border border-gray-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[var(--primary)] transition-all duration-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>

              {totalProgress === 100 && (
                <div className="mt-6 p-6 rounded-2xl border border-green-500/30 bg-green-950/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-green-400">Roadmap 100% Completed!</h4>
                    <p className="text-xs text-gray-400 mt-1">You are now eligible to claim your verified certificate of mastery.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {!certificate ? (
                      <button
                        onClick={generateCertificate}
                        className="btn-yellow text-xs font-bold py-2.5 px-6 whitespace-nowrap"
                      >
                        Claim Certificate
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => downloadFile(certificate.fileUrl, "certificate.pdf")}
                          className="btn-yellow text-xs font-bold py-2.5 px-6"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => window.open(certificate.fileUrl, "_blank")}
                          className="btn-outline text-xs font-bold py-2.5 px-6"
                        >
                          View
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modules Section */}
        {started && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400 mb-4">
              Syllabus & Modules
            </h3>
            
            <Collapse
              bordered={false}
              className="!bg-transparent space-y-4"
            >
              {roadmap.subtopics.map((mod, i) => (
                <Panel
                  key={mod._id}
                  header={
                    <div className="flex justify-between items-center w-full pr-4">
                      <span className="text-sm font-bold text-gray-100 group-hover:text-[var(--primary)] transition-colors">
                        {`${i + 1}. ${mod.name}`}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/60 border border-[rgba(250,204,21,0.2)] text-[var(--primary)]">
                        {moduleProgress(mod)}%
                      </span>
                    </div>
                  }
                  className="!bg-[#0a0a0d]/90 !border !border-[rgba(250,204,21,0.1)] hover:!border-[rgba(250,204,21,0.3)] rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                >
                  <div className="space-y-1.5 pt-2">
                    {mod.resources.map((res) => (
                      <div
                        key={res._id}
                        className="flex justify-between items-center py-3.5 px-4 rounded-xl hover:bg-white/[0.02] border-b border-gray-900 last:border-none transition-colors"
                      >
                        <Checkbox
                          checked={progress[mod.name]?.has(res.title)}
                          onChange={(e) =>
                            handleCheck(
                              mod.name,
                              res.title,
                              e.target.checked
                            )
                          }
                          className="!text-gray-300 font-semibold text-xs tracking-wide"
                        >
                          {res.title}
                        </Checkbox>

                        <a
                          href={res.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-amber-400/80 hover:text-[var(--primary)] underline transition-colors"
                        >
                          Read Material
                        </a>
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
        )}
      </main>
    </div>
  );
}
