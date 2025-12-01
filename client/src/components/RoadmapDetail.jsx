"use client";
import React, { useContext, useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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

// ✅ Helper to trigger browser file download
const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, sessionLoading } = useContext(Context);

  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState({});
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [certificate, setCertificate] = useState(null); // ✅ track certificate state

  // ✅ Fetch roadmap details
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

  // ✅ Redirect to login if no session
  useEffect(() => {
    if (!session && !sessionLoading) navigate("/login");
  }, [session, sessionLoading, navigate]);

  // ✅ Fetch progress
  useEffect(() => {
    if (!session?.id || !id) return;
    fetch(`http://localhost:4000/progress/${session.id}/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.progress) {
          const map = {};
          data.progress.subtopics?.forEach((sub) => {
            map[sub.subtopicName] = new Set(
              sub.resources.filter((r) => r.completed).map((r) => r.title)
            );
          });
          setProgress(map);
        }
      })
      .catch((err) => console.error("Progress fetch error:", err));
  }, [session, id]);

  // ✅ Update resource progress
  const handleCheck = async (modName, resTitle, checked) => {
    setProgress((prev) => {
      const updated = structuredClone(prev);
      if (!updated[modName]) updated[modName] = new Set();
      checked ? updated[modName].add(resTitle) : updated[modName].delete(resTitle);
      return { ...updated };
    });

    try {
      const res = await fetch(`http://localhost:4000/progress/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: session.id,
          roadmapId: id,
          subtopicName: modName,
          resourceTitle: resTitle,
          completed: checked,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
    } catch (err) {
      console.error(err);
      message.error("Failed to update progress");
    }
  };

  // ✅ Module progress
  const getModuleProgress = (mod) => {
    const done = progress[mod.name]?.size || 0;
    const total = mod.resources.length;
    return total ? Math.round((done / total) * 100) : 0;
  };

  // ✅ Overall roadmap progress
  const totalProgress = useMemo(() => {
    if (!roadmap?.subtopics?.length) return 0;
    const totalModules = roadmap.subtopics.length;
    const sum = roadmap.subtopics.reduce(
      (acc, mod) => acc + getModuleProgress(mod),
      0
    );
    return Math.round(sum / totalModules);
  }, [roadmap, progress]);

  // ✅ Log activity
  const createActivity = async (type, data) => {
    try {
      await fetch("http://localhost:4000/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: session.id,
          route: location.pathname,
          type,
          data,
        }),
      });
    } catch (err) {
      console.error("Failed to create activity", err);
    }
  };

  // ✅ Certificate generator
  const generateCertificate = async () => {
    const userName = session?.fullname || session?.name;
    if (!session?.id || !userName || !roadmap?.moduleTitle) {
      message.error("Missing user or roadmap info");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: session.id,
          roadmapId: id,
          roadmapName: roadmap.moduleTitle,
          userName,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (data.success && data.fileUrl) {
        const fileUrl = `http://localhost:4000${data.fileUrl}`;
        setCertificate({ id: data.certificateId, fileUrl });

        if (data.message === "Certificate already generated") {
          message.info("🎓 Certificate already generated. You can view or download it.");
        } else {
          message.success("🎉 Certificate generated successfully!");
        }
      } else {
        throw new Error("Certificate generation failed");
      }
    } catch (err) {
      console.error("Certificate error:", err);
      message.error("Failed to generate certificate");
    }
  };

  // ✅ Start roadmap
  const handleStart = async () => {
    setStarted(true);
    await createActivity(roadmap?.moduleTitle || "UnknownRoadmap", {
      roadmapId: id,
      title: roadmap?.moduleTitle,
    });
    message.success("Roadmap started successfully!");
  };

  if (loading || sessionLoading)
    return <Skeleton active paragraph={{ rows: 10 }} />;

  if (!roadmap)
    return (
      <div className="!text-white text-lg text-center mt-20">
        Failed to load roadmap.
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#111122] to-[#1c1c2e] !text-white overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-72 bg-[#151523]/80 backdrop-blur-2xl !text-white flex flex-col justify-between p-6 fixed h-screen z-40 rounded-r-xl shadow-2xl border-r border-gray-800"
          >
            <div>
              <div className="text-2xl font-bold text-center mb-10 tracking-wide text-[#68b0f3]">
                DevTrail
              </div>
              <nav className="space-y-4">
                <Link
                  to="/"
                  className="flex items-center gap-3 !text-white hover:bg-[#1c1c2e] px-3 py-2 rounded-lg transition-all"
                >
                  <HomeOutlined /> Home
                </Link>
                <Link
                  to="/roadmaps"
                  className="flex items-center gap-3 !text-white hover:bg-[#1c1c2e] px-3 py-2 rounded-lg transition-all"
                >
                  <BookOutlined /> Roadmaps
                </Link>
                <Link
                  to="/problems"
                  className="flex items-center gap-3 !text-white hover:bg-[#1c1c2e] px-3 py-2 rounded-lg transition-all"
                >
                  <CodeOutlined /> Problems
                </Link>
              </nav>
            </div>

            {/* User info */}
            <div className="bg-[#1c1c2e]/60 border border-gray-800 rounded-2xl p-4 text-center mt-8 shadow-lg !text-white">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                className="bg-[#68b0f3] text-[#0a0a14] mb-3"
              />
              <p className="text-lg font-semibold !text-white">
                {session?.fullname || session?.name || "User"}
              </p>
              <p className="text-sm text-gray-400 truncate !text-white">
                {session?.email || "user@example.com"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <Button
        type="text"
        shape="circle"
        icon={sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-5 left-5 z-50 bg-[#151523]/80 !text-white hover:bg-[#1c1c2e] shadow-lg transition-transform duration-300"
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-0"
        } px-10 py-12 !text-white`}
      >
        <Link
          to="/roadmaps"
          className="text-[#68b0f3] hover:text-[#a0c8ff] mb-8 block font-semibold text-lg transition-all"
        >
          <ArrowLeftOutlined /> Back to Roadmaps
        </Link>

        <Title level={1} className="!text-white text-5xl font-bold mb-4 tracking-wide">
          {roadmap.moduleTitle}
        </Title>

        <Paragraph className="!text-white text-lg mb-10 leading-relaxed">
          {roadmap.description}
        </Paragraph>

        {!started ? (
          <Button
            type="primary"
            size="large"
            onClick={handleStart}
            icon={<PlayCircleOutlined />}
            className="bg-[#1c3a70] border-none hover:bg-[#2a4b8c] !text-white font-semibold rounded-xl transition-transform transform hover:scale-105 shadow-md"
          >
            Start Learning
          </Button>
        ) : (
          <>
            <div className="mb-10">
              <Progress
                percent={totalProgress}
                size="large"
                strokeColor="#68b0f3"
                strokeWidth={12}
                showInfo
                className="rounded-xl"
              />
              <p className="text-[#68b0f3] mt-2 text-sm">
                Overall Progress: {totalProgress}%
              </p>

              {totalProgress === 100 && (
                <div className="flex gap-3 mt-3">
                  {!certificate ? (
                    <Button
                      onClick={generateCertificate}
                      className="bg-green-600 hover:bg-green-500 border-none text-white font-semibold rounded-lg shadow-md"
                    >
                      🎓 Generate Certificate
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() =>
                          downloadFile(
                            certificate.fileUrl,
                            `${roadmap.moduleTitle}-certificate.pdf`
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-500 border-none text-white font-semibold rounded-lg shadow-md"
                      >
                        ⬇️ Download
                      </Button>
                      <Button
                        onClick={() => window.open(certificate.fileUrl, "_blank")}
                        className="bg-purple-600 hover:bg-purple-500 border-none text-white font-semibold rounded-lg shadow-md"
                      >
                        👁️ View
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Collapse accordion bordered={false} className="space-y-4 !text-white">
              {roadmap.subtopics.map((mod, i) => (
                <Panel
                  key={mod._id}
                  header={
                    <div className="flex justify-between items-center w-full !text-white">
                      <span className="!text-white font-semibold text-lg">{`${i + 1}. ${mod.name}`}</span>
                      <Progress
                        percent={getModuleProgress(mod)}
                        size="small"
                        strokeColor="#68b0f3"
                        showInfo={false}
                        className="w-1/3"
                      />
                    </div>
                  }
                  className="bg-[#151523]/80 border border-gray-800 rounded-2xl shadow-sm !text-white"
                >
                  {mod.resources.map((res) => (
                    <div
                      key={res._id}
                      className="flex justify-between items-center mb-3 px-3 py-2 hover:bg-[#1c1c2e] rounded-xl transition-colors duration-200 shadow-inner !text-white"
                    >
                      <Checkbox
                        checked={progress[mod.name]?.has(res.title)}
                        onChange={(e) =>
                          handleCheck(mod.name, res.title, e.target.checked)
                        }
                        className="!text-white font-medium"
                      >
                        {res.title}
                      </Checkbox>
                      <Button
                        type="link"
                        href={res.link}
                        target="_blank"
                        rel="noreferrer"
                        className="!text-white hover:!text-[#68b0f3]"
                      >
                        Read
                      </Button>
                    </div>
                  ))}
                </Panel>
              ))}
            </Collapse>
          </>
        )}
      </div>
    </div>
  );
};

export default RoadmapDetail;
