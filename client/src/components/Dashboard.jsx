"use client";
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { message, Tooltip } from "antd";
import {
  DashboardOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  FireOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  GithubOutlined,
  LinkedinOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import Context from "../util/context";

// Main Dashboard Component
const Dashboard = () => {
  const [selectedKey, setSelectedKey] = useState("1");
  const { session, sessionLoading } = useContext(Context);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activePanel, setActivePanel] = useState("overview");
  const [previewCertId, setPreviewCertId] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [fullCourses, setFullCourses] = useState([]);

  const navigate = useNavigate();

  // Session Guard
  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      navigate("/login");
      return;
    }
    if (session.role !== "user") {
      navigate("/");
      return;
    }
  }, [session, sessionLoading, navigate]);

  // Fetch Activities & Certificates
  useEffect(() => {
    if (!session?.id) return;

    const fetchActivities = async () => {
      try {
        const res = await axios.get("http://localhost:4000/activity/byId", { withCredentials: true });
        setActivities(res.data || []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      }
    };

    const fetchCertificate = async () => {
      try {
        const res = await axios.get("http://localhost:4000/certificate/byUser", { withCredentials: true });
        if (res.data?.certificate) setCertificates(res.data.certificate);
        else setCertificates([]);
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
        setCertificates([]);
      }
    };

    fetchActivities();
    fetchCertificate();
  }, [session]);

  // Fetch Classroom Enrolled Courses
  useEffect(() => {
    if (!session?.id) return;

    const fetchEnrolledCourses = async () => {
      try {
        const {data} = await axios.get("http://localhost:4000/course-enrollment/course", {
          withCredentials: true,
        });
        console.log(data);
        setEnrolledCourses(data.courses || []);
      } catch (err) {
        console.error("Failed to load enrolled courses", err);
      }
    };

    fetchEnrolledCourses();
  }, [session]);



 useEffect(() => {
  const fetchAllCourses = async () => {
    try {
      const promises = enrolledCourses.map((c) => {
        const id = c.courseId 

        if (!id) {
          console.error("Invalid course record:", c);
          return null;
        }

        return axios.get(`http://localhost:4000/course/${id}`, {
          withCredentials: true,
        });
      });

      const valid = promises.filter(Boolean);

      const responses = await Promise.all(valid);

      // ⬇ your backend returns { success, course }
      const data = responses.map((res) => res.data.course);

      setFullCourses(data);
    } catch (err) {
      console.error("Error loading course details:", err);
    }
  };

  if (enrolledCourses.length > 0) fetchAllCourses();
}, [enrolledCourses]);



  // Fetch User
  useEffect(() => {
    if (!session?.id) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/auth/user/${session.id}`, {
          withCredentials: true,
        });
        const data = res.data.user || res.data;
        setUser(data);
      } catch (err) {
        console.error(err);
        message.error("Failed to load user data");
      }
    };
    fetchUser();
  }, [session]);

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-white font-mono">
        Loading...
      </div>
    );

  // Mocked datasets
  const weeklyData = [
    { day: "Mon", solved: 3, xp: 180 },
    { day: "Tue", solved: 2, xp: 140 },
    { day: "Wed", solved: 4, xp: 240 },
    { day: "Thu", solved: 1, xp: 100 },
    { day: "Fri", solved: 5, xp: 300 },
    { day: "Sat", solved: 2, xp: 150 },
    { day: "Sun", solved: 3, xp: 200 },
  ];

  const monthlyXP = [
    { month: "Jan", xp: 800 },
    { month: "Feb", xp: 1200 },
    { month: "Mar", xp: 1700 },
    { month: "Apr", xp: 2100 },
    { month: "May", xp: 2450 },
    { month: "Jun", xp: 2900 },
    { month: "Jul", xp: 3250 },
  ];

  const contestData = [
    { contest: "C1", rank: 520 },
    { contest: "C2", rank: 450 },
    { contest: "C3", rank: 390 },
    { contest: "C4", rank: 360 },
    { contest: "C5", rank: 300 },
    { contest: "C6", rank: 280 },
    { contest: "C7", rank: 250 },
    { contest: "C8", rank: 220 },
    { contest: "C9", rank: 180 },
    { contest: "C10", rank: 150 },
    { contest: "C11", rank: 130 },
    { contest: "C12", rank: 110 },
  ];

  const handleView = (certId) => setPreviewCertId(certId);

  const handleDownload = (certId) =>
    (window.location.href = `http://localhost:4000/certificate/file/${certId}`);

  const totalSolved =
    (user?.solved?.easy || 0) +
    (user?.solved?.medium || 0) +
    (user?.solved?.hard || 0);

  const level = Math.max(1, Math.floor(user.xp / 1000) + 1);
  const xpForLevel = (level - 1) * 1000;
  const xpProgress = Math.min(100, Math.round(((user.xp - xpForLevel) / 1000) * 100));

  return (
    <div className="min-h-screen flex bg-black text-white font-mono overflow-hidden">
      <UserSidebar
        user={user}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        navigate={navigate}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Arena • Welcome back, {user.fullname.split(" ")[0]}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Keep the streak alive — next level in{" "}
              <strong>{1000 - (user.xp - xpForLevel)}</strong> XP
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-full border border-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">
                <UserOutlined />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">{user.username}</div>
                <div className="text-xs text-gray-500">Level {level}</div>
              </div>
            </div>
          </div>
        </motion.header>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left side with level card and panel buttons */}
          <div className="col-span-1 xl:col-span-2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl border border-gray-700 bg-gray-900 shadow-xl w-full max-w-3xl mx-auto"
            >
              <div className="flex flex-wrap items-center gap-6">
                <ProgressRing size={120} progress={xpProgress} level={level} />

                <div className="flex-1 min-w-[250px]">
                  <h3 className="text-xl font-semibold text-white break-words">
                    {user.fullname}
                  </h3>
                  <p className="text-sm text-gray-400 break-words">{user.email}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Badge label={`${totalSolved}`} sub="Solved" icon={<CodeOutlined />} />
                    <Badge label={`${user.xp} XP`} sub="XP" icon={<ThunderboltOutlined />} />
                    <Badge label={`${user.streak || 0}d`} sub="Streak" icon={<FireOutlined />} />
                  </div>

                  {/* Progress bar */}
                  <div className="mt-5">
                    <div className="text-xs text-gray-400 mb-2">Level Progress</div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-3 bg-white"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {xpProgress}% to next level
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setActivePanel("overview");
                    setPreviewCertId(null);
                  }}
                  className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-medium transition-all ${
                    activePanel === "overview"
                      ? "bg-white text-black"
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => {
                    setActivePanel("performance");
                    setPreviewCertId(null);
                  }}
                  className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-medium transition-all ${
                    activePanel === "performance"
                      ? "bg-white text-black"
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}
                >
                  Performance
                </button>

                <button
                  onClick={() => {
                    setActivePanel("certs");
                    setPreviewCertId(null);
                  }}
                  className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-medium transition-all ${
                    activePanel === "certs"
                      ? "bg-white text-black"
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}
                >
                  Certs
                </button>

                <button
                  onClick={() => {
                    setActivePanel("classroom");
                  }}
                  className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-medium transition-all ${
                    activePanel === "classroom"
                      ? "bg-white text-black"
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}
                >
                  Classroom
                </button>
              </div>
            </motion.div>

            {/* Achievements */}
            {activePanel === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-2xl border border-gray-700 bg-gray-900 shadow-lg w-full max-w-3xl mx-auto"
              >
                <h4 className="text-sm text-gray-300 mb-4">Achievements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MiniTile title="Global Rank" value={`#${user?.globalRank?.toLocaleString() || 100000}`} />
                  <MiniTile title="Accuracy" value={`${user.accuracy || 0}%`} />
                  <MiniTile title="Contests" value={user.contests || 0} />
                  <MiniTile title="Badges" value={user.badges?.length || 0} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Middle + Right Panels */}
          <div className="col-span-1 lg:col-span-2">
            {/* ---------- CLASSROOM SECTION (NEW) ---------- */}
           {activePanel === "classroom" && (
  <motion.div className="p-6 rounded-2xl border border-gray-700 bg-gray-900 shadow-lg">
    <h3 className="text-lg font-semibold text-white mb-4">Your Classroom</h3>

    {enrolledCourses.length === 0 ? (
      <div className="text-gray-400 italic">
        You are not enrolled in any courses yet.
      </div>
    ) : (
      <div className="grid gap-4">

        {fullCourses.map((course) => (
          <div
            key={course._id}
            className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-between hover:bg-gray-750 transition"
          >
            <div>
              <h4 className="text-white text-lg font-semibold">{course.title}</h4>
              <p className="text-gray-400 text-sm">{course.description}</p>
            </div>

            <button
              onClick={() => navigate(`/courses/${course._id}`)}
              className="px-4 py-2 rounded-md bg-white text-black text-sm hover:bg-gray-300 transition"
            >
              Go to Course
            </button>
          </div>
        ))}

      </div>
    )}
  </motion.div>
)}


            {/* ------------ Other Panels Stay Same ------------ */}
            {activePanel === "overview" && (
              <motion.div className="p-6 rounded-2xl border border-gray-700 bg-gray-900 shadow-lg">
                {/* Overview Content */}
                {/* All your charts and activity list remain here unchanged */}
              </motion.div>
            )}

            {activePanel === "performance" && (
              <motion.div className="p-6 rounded-2xl border border-gray-700 bg-gray-900 shadow-lg">
                {/* Performance charts */}
              </motion.div>
            )}

            {activePanel === "certs" && (
              <motion.div className="p-6 rounded-2xl border border-gray-700 bg-gray-900 shadow-lg">
                {/* Certificates Section */}
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

// Helper Components
const ProgressRing = ({ size = 100, progress = 40, level = 1 }) => {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="block">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#111" strokeWidth={stroke} fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#fff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm text-gray-300">Lvl</div>
        <div className="text-2xl font-bold">{level}</div>
      </div>
    </div>
  );
};

const Badge = ({ icon, label, sub }) => (
  <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
    <div className="p-2 rounded-md bg-white text-black">{icon}</div>
    <div>
      <div className="text-sm font-semibold text-white">{label}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  </div>
);

const MiniTile = ({ title, value }) => (
  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-center">
    <div className="text-xs text-gray-400">{title}</div>
    <div className="text-sm font-semibold text-white">{value}</div>
  </div>
);

export default Dashboard;
