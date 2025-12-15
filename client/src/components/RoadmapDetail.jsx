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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    fetch(`http://localhost:4000/progress/${session.id}/${id}`, {
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
      await fetch(`http://localhost:4000/progress/update`, {
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
      const res = await fetch("http://localhost:4000/certificate/generate", {
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
          fileUrl: `http://localhost:4000${d.fileUrl}`,
        });
      }
    } catch {
      message.error("Certificate error");
    }
  };

  if (loading || sessionLoading)
    return <Skeleton active paragraph={{ rows: 8 }} />;

  if (!roadmap) return <div className="mt-20 text-center">Failed</div>;

  return (
    <div className="grid-bg min-h-screen bg-black text-white font-mono overflow-hidden flex">
      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            className="fixed z-40 w-64 h-screen !bg-black/90 border-r border-gray-800 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="text-lg tracking-widest font-bold mb-8">
                DEVTRAIL
              </div>

              <nav className="space-y-4 text-sm">
                <Link className="block hover:text-gray-300" to="/">
                  <HomeOutlined /> Home
                </Link>
                <Link className="block hover:text-gray-300" to="/roadmaps">
                  <BookOutlined /> Roadmaps
                </Link>
                <Link className="block hover:text-gray-300" to="/problems">
                  <CodeOutlined /> Problems
                </Link>
              </nav>
            </div>

            <div className="border border-gray-800 rounded-xl p-4 text-center">
              <Avatar size={52} icon={<UserOutlined />} />
              <p className="mt-2 text-sm">
                {session?.fullname || session?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.email}
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* TOGGLE */}
      <Button
        type="text"
        icon={sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 !text-white hover:!text-gray-300"
      />

      {/* CONTENT */}
      <main
        className={`flex-1 px-10 py-10 transition-all ${
          sidebarOpen ? "ml-64" : ""
        }`}
      >
        <Link
          to="/roadmaps"
          className="text-gray-400 hover:text-white inline-block mb-6"
        >
          <ArrowLeftOutlined /> Back
        </Link>

        <Title className="!text-white !mb-2 !font-mono">
          {roadmap.moduleTitle}
        </Title>

        <Paragraph className="!text-gray-400 !font-mono max-w-3xl">
          {roadmap.description}
        </Paragraph>

        {!started ? (
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => setStarted(true)}
            className="!bg-transparent !border !border-white !text-white hover:!bg-white hover:!text-black transition-all"
          >
            Start Learning
          </Button>
        ) : (
          <>
            <div className="max-w-xl mt-6">
              <Progress
                percent={totalProgress}
                strokeColor="#7500e2aa"
                trailColor="#1f2937"
                className="!font-mono"
              />
            </div>

            {totalProgress === 100 && (
              <div className="mt-4 flex gap-3">
                {!certificate ? (
                  <Button
                    onClick={generateCertificate}
                    className="!bg-white !text-black !border-none"
                  >
                    Generate Certificate
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() =>
                        downloadFile(certificate.fileUrl, "certificate.pdf")
                      }
                      className="!bg-purple-900 !text-black !mb-5"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(certificate.fileUrl, "_blank")
                      }
                      className="!bg-transparent !border !border-white !text-white"
                    >
                      View
                    </Button>
                  </>
                )}
              </div>
            )}

            <Collapse
              bordered={false}
              className="mt-8 !bg-transparent !font-mono"
            >
              {roadmap.subtopics.map((mod, i) => (
                <Panel
                  key={mod._id}
                  header={
                    <div className="flex justify-between items-center w-full">
                      <span className="text-purple-600">{`${i + 1}. ${mod.name}`}</span>
                      <span className="text-xs text-gray-400">
                        {moduleProgress(mod)}%
                      </span>
                    </div>
                  }
                  className="!bg-gray-900 !border !border-purple-800 mb-3"
                >
                  {mod.resources.map((res) => (
                    <div
                      key={res._id}
                      className="flex justify-between items-center py-2 border-b border-gray-800 last:border-none"
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
                        className="!text-white"
                      >
                        {res.title}
                      </Checkbox>

                      <a
                        href={res.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        Read
                      </a>
                    </div>
                  ))}
                </Panel>
              ))}
            </Collapse>
          </>
        )}
      </main>
    </div>
  );
}
