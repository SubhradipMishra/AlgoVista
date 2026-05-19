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
  const [enrolledMentorships, setEnrolledMentorships] = useState([]);

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

  // Fetch Enrolled Mentorships
  useEffect(() => {
    if (!session?.id) return;

    const fetchMentorships = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/mentorship?userId=${session.id}&status=active`, {
          withCredentials: true,
        });
        
        const detailsPromises = res.data.map(async (m) => {
          try {
            const mRes = await axios.get(`http://localhost:4000/mentor-details/${m.mentor}`, {
              withCredentials: true,
            });
            const mentorObj = Array.isArray(mRes.data) ? mRes.data[0] : mRes.data;
            const plan = mentorObj?.plans?.find((p) => p._id === m.planId);
            return {
              ...m,
              mentorName: mentorObj?.fullname || "Mentor",
              mentorImage: mentorObj?.profileImage,
              planTitle: plan?.title || "Mentorship Plan",
            };
          } catch (err) {
            console.error("Failed to load mentor details for", m.mentor, err);
            return {
              ...m,
              mentorName: "Premium Mentor",
              planTitle: "Mentorship Plan",
            };
          }
        });

        const detailedMentorships = await Promise.all(detailsPromises);
        setEnrolledMentorships(detailedMentorships);
      } catch (err) {
        console.error("Failed to load user mentorships", err);
      }
    };

    fetchMentorships();
  }, [session]);



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
    <div className="min-h-screen flex bg-black text-gray-200 font-mono overflow-hidden relative">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.015)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      <UserSidebar
        user={user}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        navigate={navigate}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
        
        {/* Header section */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-gray-900 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[var(--primary)] uppercase mb-1">
              <span>◈ User Terminal Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
              Arena Welcome • {user.fullname.split(" ")[0]}
            </h1>
            <p className="text-gray-400 text-xs mt-1 font-semibold">
              Keep the streak alive — Next Level requires{" "}
              <strong className="text-[var(--primary)]">{1000 - (user.xp - xpForLevel)}</strong> XP
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#07070a] border border-gray-900 p-2 px-4 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-black border border-[rgba(250,204,21,0.15)] flex items-center justify-center text-sm text-[var(--primary)]">
              <UserOutlined />
            </div>
            <div className="text-left font-mono">
              <div className="text-xs font-black text-white tracking-wide uppercase">{user.username}</div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Level {level}</div>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Panels Grid */}
        <motion.section 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column: Profile stats + Tab controls */}
          <div className="col-span-1 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl p-6 bg-[#07070a]/95 border border-[rgba(250,204,21,0.15)] overflow-hidden"
            >
              {/* Corner Sci-Fi bracket decorations */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[var(--primary)] opacity-40"></div>

              <div className="flex flex-col items-center text-center gap-5">
                <ProgressRing size={110} progress={xpProgress} level={level} />

                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {user.fullname}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">{user.email}</p>
                </div>

                {/* Badge statistics */}
                <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-gray-900/60">
                  <Badge label={totalSolved} sub="Solved" icon={<CodeOutlined />} />
                  <Badge label={`${user.xp}`} sub="Total XP" icon={<ThunderboltOutlined />} />
                  <Badge label={`${user.streak || 0}d`} sub="Streak" icon={<FireOutlined />} />
                </div>

                {/* Cyber Progress Indicator */}
                <div className="w-full mt-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    <span>Rank Progress</span>
                    <span className="text-[var(--primary)]">{xpProgress}%</span>
                  </div>
                  
                  <div className="w-full bg-black rounded-lg h-2 overflow-hidden border border-gray-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-[var(--primary)] shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                    />
                  </div>
                </div>
              </div>

              {/* HUD Panel Navigation Tabs */}
              <div className="mt-8 flex flex-col gap-2 border-t border-gray-900/60 pt-6">
                <button
                  onClick={() => {
                    setActivePanel("overview");
                    setPreviewCertId(null);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left flex items-center justify-between ${
                    activePanel === "overview"
                      ? "bg-[rgba(250,204,21,0.08)] border border-[var(--primary)] text-white shadow-[inset_0_0_15px_rgba(250,204,21,0.05)]"
                      : "bg-black/40 border border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                  }`}
                >
                  <span>◈ Overview Hub</span>
                  <span className={activePanel === "overview" ? "text-[var(--primary)]" : "text-gray-700"}>→</span>
                </button>

                <button
                  onClick={() => {
                    setActivePanel("performance");
                    setPreviewCertId(null);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left flex items-center justify-between ${
                    activePanel === "performance"
                      ? "bg-[rgba(250,204,21,0.08)] border border-[var(--primary)] text-white shadow-[inset_0_0_15px_rgba(250,204,21,0.05)]"
                      : "bg-black/40 border border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                  }`}
                >
                  <span>◈ Performance metrics</span>
                  <span className={activePanel === "performance" ? "text-[var(--primary)]" : "text-gray-700"}>→</span>
                </button>

                <button
                  onClick={() => {
                    setActivePanel("certs");
                    setPreviewCertId(null);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left flex items-center justify-between ${
                    activePanel === "certs"
                      ? "bg-[rgba(250,204,21,0.08)] border border-[var(--primary)] text-white shadow-[inset_0_0_15px_rgba(250,204,21,0.05)]"
                      : "bg-black/40 border border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                  }`}
                >
                  <span>◈ Certificates Hub</span>
                  <span className={activePanel === "certs" ? "text-[var(--primary)]" : "text-gray-700"}>→</span>
                </button>

                <button
                  onClick={() => {
                    setActivePanel("classroom");
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left flex items-center justify-between ${
                    activePanel === "classroom"
                      ? "bg-[rgba(250,204,21,0.08)] border border-[var(--primary)] text-white shadow-[inset_0_0_15px_rgba(250,204,21,0.05)]"
                      : "bg-black/40 border border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                  }`}
                >
                  <span>◈ Enrolled classroom</span>
                  <span className={activePanel === "classroom" ? "text-[var(--primary)]" : "text-gray-700"}>→</span>
                </button>

                <button
                  onClick={() => {
                    setActivePanel("mentorships");
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left flex items-center justify-between ${
                    activePanel === "mentorships"
                      ? "bg-[rgba(250,204,21,0.08)] border border-[var(--primary)] text-white shadow-[inset_0_0_15px_rgba(250,204,21,0.05)]"
                      : "bg-black/40 border border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                  }`}
                >
                  <span>◈ Mentorship Programs</span>
                  <span className={activePanel === "mentorships" ? "text-[var(--primary)]" : "text-gray-700"}>→</span>
                </button>
              </div>
            </motion.div>

            {/* Global Achievements summary */}
            {activePanel === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative rounded-2xl p-5 bg-[#07070a]/95 border border-gray-900 overflow-hidden"
              >
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[var(--primary)] opacity-30"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">◈ Global Standing</h4>
                <div className="grid grid-cols-2 gap-3">
                  <MiniTile title="Global Rank" value={`#${user?.globalRank?.toLocaleString() || "13,420"}`} />
                  <MiniTile title="Avg Accuracy" value={`${user.accuracy || 76}%`} />
                  <MiniTile title="Contests Joined" value={user.contests || 14} />
                  <MiniTile title="Earned Badges" value={user.badges?.length || 5} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Dynamic Panel content */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            
            {/* ---------- CLASSROOM VIEW ---------- */}
            {activePanel === "classroom" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Academic Classroom</h3>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-950 p-12 text-center text-xs font-bold uppercase tracking-widest text-gray-600">
                    No active course enrollments registered.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {fullCourses.map((course) => (
                      <div
                        key={course._id}
                        className="p-5 bg-black border border-gray-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[rgba(250,204,21,0.25)] transition-all duration-300"
                      >
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wide">{course.title}</h4>
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{course.description}</p>
                        </div>

                        <button
                          onClick={() => navigate(`/courses/${course._id}`)}
                          className="w-full sm:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--primary)] text-black hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(250,204,21,0.2)] rounded-lg transition-all duration-300"
                        >
                          Launch Course
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------- MENTORSHIP VIEW ---------- */}
            {activePanel === "mentorships" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Active Mentorship Subscriptions</h3>
                </div>

                {enrolledMentorships.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-950 p-12 text-center text-xs font-bold uppercase tracking-widest text-gray-600">
                    No active mentorship subscriptions registered.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {enrolledMentorships.map((m) => (
                      <div
                        key={m._id}
                        className="p-5 bg-black border border-gray-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[rgba(250,204,21,0.25)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={m.mentorImage || "/default-avatar.png"}
                            alt="Mentor"
                            className="w-12 h-12 rounded-full border border-gray-800 bg-black"
                          />
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">{m.mentorName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-amber-300/80 bg-black/60 border border-[rgba(250,204,21,0.15)] px-2 py-0.5 rounded">
                                {m.planTitle} Plan
                              </span>
                              <span className="text-[9px] text-gray-500 font-bold uppercase">
                                Ends: {new Date(m.endingDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/mentorship/${m.mentor}/${m.planId}`)}
                          className="w-full sm:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--primary)] text-black hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(250,204,21,0.2)] rounded-lg transition-all duration-300"
                        >
                          Go to Workspace
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------- OVERVIEW VIEW (CHARTS) ---------- */}
            {activePanel === "overview" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative flex flex-col gap-6"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                
                <div className="flex items-start justify-between gap-6 border-b border-gray-950 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Performance Terminal</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time analytical telemetry & metrics</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip title="Sync with GitHub">
                      <button className="p-2 rounded-lg bg-black border border-gray-900 text-xs text-gray-400 hover:text-white hover:border-gray-800 transition-colors"><GithubOutlined /></button>
                    </Tooltip>
                    <Tooltip title="Share on LinkedIn">
                      <button className="p-2 rounded-lg bg-black border border-gray-900 text-xs text-gray-400 hover:text-white hover:border-gray-800 transition-colors"><LinkedinOutlined /></button>
                    </Tooltip>
                  </div>
                </div>

                {/* Primary charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-black border border-gray-950">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">◈ Weekly Solve telemetry</h4>
                    <div style={{ height: 210 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} margin={{ left: -25 }}>
                          <XAxis dataKey="day" stroke="#444" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                          <YAxis stroke="#444" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                          <ChartTooltip contentStyle={{ backgroundColor: "#07070a", border: "1px solid #222", borderRadius: '8px', fontSize: 10, fontFamily: 'monospace' }} />
                          <Bar dataKey="solved" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black border border-gray-950">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">◈ Experience Growth path</h4>
                    <div style={{ height: 210 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyXP} margin={{ left: -25 }}>
                          <XAxis dataKey="month" stroke="#444" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                          <YAxis stroke="#444" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                          <ChartTooltip contentStyle={{ backgroundColor: "#07070a", border: "1px solid #222", borderRadius: '8px', fontSize: 10, fontFamily: 'monospace' }} />
                          <Line type="monotone" dataKey="xp" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: '#000', stroke: 'var(--primary)', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-black border border-gray-950">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">◈ Competitive Contest rating curve</h4>
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={contestData} margin={{ left: -25 }}>
                          <defs>
                            <linearGradient id="glowGold" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="contest" stroke="#444" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                          <YAxis reversed stroke="#444" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                          <ChartTooltip contentStyle={{ backgroundColor: "#07070a", border: "1px solid #222", borderRadius: '8px', fontSize: 10, fontFamily: 'monospace' }} />
                          <Area type="monotone" dataKey="rank" stroke="var(--primary)" fillOpacity={1} fill="url(#glowGold)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Terminals Logs Style Recent Activity list */}
                <div className="mt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3.5">◈ Real-time Event Logger</h4>
                  {activities.length > 0 ? (
                    <div className="grid gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {activities.map((act, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black border border-gray-950 hover:border-gray-900 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            <div>
                              <div className="text-xs text-white leading-relaxed">
                                <strong className="text-[var(--primary)] font-bold uppercase tracking-wider">{act.data?.name || act.type || "Interaction"}</strong>
                                <span className="text-gray-400 ml-1.5">— {act.data?.description || "Submitting solutions to compilers"}</span>
                              </div>
                              <div className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{new Date(act.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(act.route || "/problems")} 
                            className="px-3 py-1 rounded bg-black border border-gray-900 hover:border-[var(--primary)] hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"
                          >
                            Browse
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-950 p-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-600">
                      Telemetry logs are currently empty.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ---------- PERFORMANCE VIEW ---------- */}
            {activePanel === "performance" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Diagnostic Performance Metrics</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black border border-gray-900 rounded-xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Easy challenges solved</div>
                    <div className="text-2xl font-black text-white">{user?.solved?.easy || 15}</div>
                  </div>
                  <div className="p-4 bg-black border border-gray-900 rounded-xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Medium challenges solved</div>
                    <div className="text-2xl font-black text-amber-400">{user?.solved?.medium || 8}</div>
                  </div>
                  <div className="p-4 bg-black border border-gray-900 rounded-xl col-span-1 md:col-span-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Hard challenges solved</div>
                    <div className="text-2xl font-black text-red-500">{user?.solved?.hard || 2}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---------- CERTIFICATE VIEW ---------- */}
            {activePanel === "certs" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6 border-b border-gray-950 pb-4">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Earned Credentials</h3>
                </div>

                {certificates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-950 p-12 text-center text-xs font-bold uppercase tracking-widest text-gray-600">
                    No verified credentials unlocked yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div
                        key={cert._id}
                        className="relative rounded-xl p-4 bg-black border border-gray-900 hover:border-[var(--primary)] transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-2">Verified Certificate</div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wide leading-relaxed">{cert.courseTitle || "Premium Algorithm Course"}</h4>
                          <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest">ID: {cert._id}</div>
                        </div>

                        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-950">
                          <button
                            onClick={() => handleView(cert._id)}
                            className="flex-1 text-[9px] font-black uppercase tracking-widest py-2 bg-black border border-gray-900 text-gray-400 hover:text-white rounded"
                          >
                            <EyeOutlined className="mr-1" /> View
                          </button>
                          
                          <button
                            onClick={() => handleDownload(cert._id)}
                            className="flex-1 text-[9px] font-black uppercase tracking-widest py-2 bg-[var(--primary)] text-black font-bold rounded"
                          >
                            <DownloadOutlined className="mr-1" /> Get PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certificate Preview Modal */}
                {previewCertId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative rounded-2xl border border-gray-900 bg-black p-5 w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-gray-950 pb-3 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">◈ Certificate Viewer</span>
                        <button
                          onClick={() => setPreviewCertId(null)}
                          className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <div className="flex justify-center border border-gray-950 rounded-xl overflow-hidden bg-black p-4">
                        <iframe
                          src={`http://localhost:4000/certificate/file/${previewCertId}`}
                          title="Certificate Preview"
                          className="w-full h-[55vh] border-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

// Helper Components
const ProgressRing = ({ size = 110, progress = 40, level = 1 }) => {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="block">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.02)" strokeWidth={stroke} fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="transparent"
          className="drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Level</div>
        <div className="text-2xl font-black text-white mt-0.5 leading-none">{level}</div>
      </div>
    </div>
  );
};

const Badge = ({ icon, label, sub }) => (
  <div className="flex flex-col items-center justify-center bg-black border border-gray-950 p-3.5 rounded-xl text-center">
    <div className="text-[var(--primary)] text-sm mb-1">{icon}</div>
    <div className="text-xs font-black text-white tracking-wide">{label}</div>
    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">{sub}</div>
  </div>
);

const MiniTile = ({ title, value }) => (
  <div className="relative p-4 rounded-xl bg-black border border-gray-950 overflow-hidden text-center group">
    <div className="absolute top-1 left-1 w-1 h-1 border-t border-l border-[var(--primary)] opacity-20"></div>
    <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5">{title}</div>
    <div className="text-sm font-black text-white tracking-wider">{value}</div>
  </div>
);

export default Dashboard;
