"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { message, Tooltip } from "antd";
import {
  CodeOutlined,
  FireOutlined,
  ThunderboltOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import Context from "../util/context";

const EMPTY_DASHBOARD = {
  weeklyActivity: Array.from({ length: 7 }, (_, index) => ({
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
    solved: 0,
    xp: 0,
  })),
  monthlyXP: Array.from({ length: 6 }, (_, index) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index],
    xp: 0,
  })),
  achievements: [],
  insightStats: {
    totalSolved: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    accuracy: 0,
    completedResources: 0,
    completedRoadmaps: 0,
    certificatesEarned: 0,
    communitiesJoined: 0,
    communityPosts: 0,
    communityComments: 0,
    streak: 0,
    longestStreak: 0,
    activeDays: 0,
  },
};

const Dashboard = () => {
  const { session, sessionLoading } = useContext(Context);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD);
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [fullCourses, setFullCourses] = useState([]);
  const [enrolledMentorships, setEnrolledMentorships] = useState([]);
  const [activePanel, setActivePanel] = useState("overview");
  const [previewCertId, setPreviewCertId] = useState(null);
  const [selectedKey, setSelectedKey] = useState("1");

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      navigate("/login");
      return;
    }
    if (session.role !== "user") {
      navigate("/");
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    if (!session?.id) return;

    const loadDashboard = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/auth/user/${session.id}`, {
          withCredentials: true,
        });
        setUser(response.data.user || response.data);
        setDashboardData(response.data.dashboard || EMPTY_DASHBOARD);
      } catch (error) {
        console.error(error);
        message.error("Failed to load dashboard insights");
      }
    };

    const loadActivities = async () => {
      try {
        const response = await axios.get("http://localhost:4000/activity/byId", {
          withCredentials: true,
        });
        setActivities(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };

    const loadCertificates = async () => {
      try {
        const response = await axios.get("http://localhost:4000/certificate/byUser", {
          withCredentials: true,
        });
        setCertificates(response.data?.certificate || []);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
        setCertificates([]);
      }
    };

    const loadCourses = async () => {
      try {
        const response = await axios.get("http://localhost:4000/course-enrollment/course", {
          withCredentials: true,
        });
        setEnrolledCourses(response.data?.courses || []);
      } catch (error) {
        console.error("Failed to load enrolled courses:", error);
      }
    };

    const loadMentorships = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/mentorship?userId=${session.id}&status=active`,
          { withCredentials: true }
        );

        const detailedMentorships = await Promise.all(
          (response.data || []).map(async (entry) => {
            try {
              const mentorResponse = await axios.get(
                `http://localhost:4000/mentor-details/${entry.mentor}`,
                { withCredentials: true }
              );
              const mentor = Array.isArray(mentorResponse.data)
                ? mentorResponse.data[0]
                : mentorResponse.data;
              const plan = mentor?.plans?.find((item) => item._id === entry.planId);

              return {
                ...entry,
                mentorName: mentor?.fullname || "Mentor",
                mentorImage: mentor?.profileImage,
                planTitle: plan?.title || "Mentorship Plan",
              };
            } catch (error) {
              console.error("Failed to load mentorship details:", error);
              return {
                ...entry,
                mentorName: "Premium Mentor",
                planTitle: "Mentorship Plan",
              };
            }
          })
        );

        setEnrolledMentorships(detailedMentorships);
      } catch (error) {
        console.error("Failed to load user mentorships:", error);
      }
    };

    loadDashboard();
    loadActivities();
    loadCertificates();
    loadCourses();
    loadMentorships();
  }, [session]);

  useEffect(() => {
    if (!enrolledCourses.length) {
      setFullCourses([]);
      return;
    }

    const loadCourseDetails = async () => {
      try {
        const responses = await Promise.all(
          enrolledCourses
            .map((course) => course?.courseId)
            .filter(Boolean)
            .map((courseId) =>
              axios.get(`http://localhost:4000/course/${courseId}`, {
                withCredentials: true,
              })
            )
        );

        setFullCourses(responses.map((response) => response.data.course).filter(Boolean));
      } catch (error) {
        console.error("Error loading course details:", error);
      }
    };

    loadCourseDetails();
  }, [enrolledCourses]);

  const gamifiedUser = useMemo(() => {
    if (!user) return null;

    const xp = Number(user.xp || 0);
    const level = Number(user.level || Math.max(1, Math.floor(xp / 1000) + 1));
    const levelBase = (level - 1) * 1000;
    const xpIntoLevel = xp - levelBase;
    const xpToNextLevel = Math.max(0, 1000 - xpIntoLevel);
    const xpProgress = Math.min(100, Math.max(0, Math.round((xpIntoLevel / 1000) * 100)));

    return {
      ...user,
      xp,
      level,
      xpToNextLevel,
      xpProgress,
      firstName: user.fullname?.split(" ")?.[0] || "Learner",
      totalSolved:
        Number(user.totalSolved) ||
        Number(user?.solved?.easy || 0) +
          Number(user?.solved?.medium || 0) +
          Number(user?.solved?.hard || 0),
    };
  }, [user]);

  if (!gamifiedUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
        Loading dashboard...
      </div>
    );
  }

  const stats = dashboardData.insightStats || EMPTY_DASHBOARD.insightStats;
  const achievements = dashboardData.achievements || [];
  const weeklyActivity = dashboardData.weeklyActivity?.length
    ? dashboardData.weeklyActivity
    : EMPTY_DASHBOARD.weeklyActivity;
  const monthlyXP = dashboardData.monthlyXP?.length
    ? dashboardData.monthlyXP
    : EMPTY_DASHBOARD.monthlyXP;

  const handleDownload = (certificateId) => {
    window.location.href = `http://localhost:4000/certificate/file/${certificateId}`;
  };

  return (
    <div className="min-h-screen flex bg-black text-gray-200 font-mono overflow-hidden relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.015)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      <UserSidebar
        user={gamifiedUser}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        navigate={navigate}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-gray-900 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[var(--primary)] uppercase mb-1">
              <span>◈ Gamification Core Synced</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
              Arena Welcome • {gamifiedUser.firstName}
            </h1>
            <p className="text-gray-400 text-xs mt-1 font-semibold">
              Next level unlocks in{" "}
              <strong className="text-[var(--primary)]">{gamifiedUser.xpToNextLevel}</strong> XP
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#07070a] border border-gray-900 p-2 px-4 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-black border border-[rgba(250,204,21,0.15)] flex items-center justify-center text-sm text-[var(--primary)]">
              <UserOutlined />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-white tracking-wide uppercase">
                {gamifiedUser.rank}
              </div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                Level {gamifiedUser.level}
              </div>
            </div>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl p-6 bg-[#07070a]/95 border border-[rgba(250,204,21,0.15)] overflow-hidden"
            >
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[var(--primary)] opacity-40"></div>

              <div className="flex flex-col items-center text-center gap-5">
                <ProgressRing
                  size={116}
                  progress={gamifiedUser.xpProgress}
                  level={gamifiedUser.level}
                />

                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {gamifiedUser.fullname}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">
                    {gamifiedUser.email}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-gray-900/60">
                  <MetricBadge
                    label={gamifiedUser.totalSolved}
                    sub="Solved"
                    icon={<CodeOutlined />}
                  />
                  <MetricBadge
                    label={gamifiedUser.xp}
                    sub="Total XP"
                    icon={<ThunderboltOutlined />}
                  />
                  <MetricBadge
                    label={`${gamifiedUser.streak || 0}d`}
                    sub="Streak"
                    icon={<FireOutlined />}
                  />
                </div>

                <div className="w-full mt-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    <span>Level Progress</span>
                    <span className="text-[var(--primary)]">{gamifiedUser.xpProgress}%</span>
                  </div>
                  <div className="w-full bg-black rounded-lg h-2 overflow-hidden border border-gray-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gamifiedUser.xpProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-[var(--primary)] shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 border-t border-gray-900/60 pt-6">
                {[
                  ["overview", "◈ Overview Hub"],
                  ["performance", "◈ Performance Grid"],
                  ["certs", "◈ Certificates Hub"],
                  ["classroom", "◈ Enrolled Classroom"],
                  ["mentorships", "◈ Mentorship Programs"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActivePanel(key);
                      if (key !== "certs") setPreviewCertId(null);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left flex items-center justify-between ${
                      activePanel === key
                        ? "bg-[rgba(250,204,21,0.08)] border border-[var(--primary)] text-white shadow-[inset_0_0_15px_rgba(250,204,21,0.05)]"
                        : "bg-black/40 border border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                    }`}
                  >
                    <span>{label}</span>
                    <span className={activePanel === key ? "text-[var(--primary)]" : "text-gray-700"}>
                      →
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl p-5 bg-[#07070a]/95 border border-gray-900 overflow-hidden"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                ◈ Global Standing
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <MiniTile title="Global Rank" value={`#${gamifiedUser.globalRank || 0}`} />
                <MiniTile title="Accuracy" value={`${gamifiedUser.accuracy || 0}%`} />
                <MiniTile title="Longest Streak" value={`${gamifiedUser.longestStreak || 0}d`} />
                <MiniTile title="Earned Badges" value={achievements.length} />
              </div>
            </motion.div>
          </div>

          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            {activePanel === "overview" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative flex flex-col gap-6"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>

                <div className="flex items-start justify-between gap-6 border-b border-gray-950 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Performance Terminal
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      Live telemetry generated from real submissions and progress events
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip title="Total XP">
                      <StatPill icon={<ThunderboltOutlined />} label={`${gamifiedUser.xp} XP`} />
                    </Tooltip>
                    <Tooltip title="Badges Unlocked">
                      <StatPill icon={<TrophyOutlined />} label={`${achievements.length} Badges`} />
                    </Tooltip>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChartCard title="◈ Weekly Solve Telemetry">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyActivity} margin={{ left: -25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                        <XAxis dataKey="day" stroke="#444" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                        <YAxis stroke="#444" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: "#07070a",
                            border: "1px solid #222",
                            borderRadius: 8,
                            fontSize: 10,
                            fontFamily: "monospace",
                          }}
                        />
                        <Bar dataKey="solved" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="◈ Experience Growth Path">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyXP} margin={{ left: -25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                        <XAxis dataKey="month" stroke="#444" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                        <YAxis stroke="#444" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: "#07070a",
                            border: "1px solid #222",
                            borderRadius: 8,
                            fontSize: 10,
                            fontFamily: "monospace",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="xp"
                          stroke="var(--primary)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "#000", stroke: "var(--primary)", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                  <div className="rounded-xl bg-black border border-gray-950 p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                      ◈ Achievement Wall
                    </h4>
                    {achievements.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {achievements.map((badge) => (
                          <div
                            key={badge.key}
                            className="rounded-xl border border-[rgba(250,204,21,0.15)] bg-[#07070a] p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.18)] flex items-center justify-center text-[var(--primary)]">
                                <TrophyOutlined />
                              </div>
                              <div>
                                <div className="text-xs font-black text-white uppercase tracking-wide">
                                  {badge.label}
                                </div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                                  {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : "Unlocked"}
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                              {badge.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyPanel text="No badges unlocked yet. Your next solved problem will start the streak." />
                    )}
                  </div>

                  <div className="rounded-xl bg-black border border-gray-950 p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                      ◈ Momentum Snapshot
                    </h4>
                    <div className="grid gap-3">
                      <InsightRow icon={<RiseOutlined />} label="Accepted submissions" value={stats.acceptedSubmissions} />
                      <InsightRow icon={<BookOutlined />} label="Completed resources" value={stats.completedResources} />
                      <InsightRow icon={<SafetyCertificateOutlined />} label="Certificates" value={stats.certificatesEarned} />
                      <InsightRow icon={<TeamOutlined />} label="Community actions" value={stats.communityPosts + stats.communityComments} />
                      <InsightRow icon={<FireOutlined />} label="Active days" value={stats.activeDays} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3.5">
                    ◈ Real-time Event Logger
                  </h4>
                  {activities.length ? (
                    <div className="grid gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {activities.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black border border-gray-950 hover:border-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            <div>
                              <div className="text-xs text-white leading-relaxed">
                                <strong className="text-[var(--primary)] font-bold uppercase tracking-wider">
                                  {activity.data?.name || activity.type || "Activity"}
                                </strong>
                                <span className="text-gray-400 ml-1.5">
                                  — {activity.data?.description || "User interaction recorded."}
                                </span>
                              </div>
                              <div className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">
                                {new Date(activity.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(activity.route || "/problems")}
                            className="px-3 py-1 rounded bg-black border border-gray-900 hover:border-[var(--primary)] hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"
                          >
                            Browse
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyPanel text="Telemetry logs are currently empty." />
                  )}
                </div>
              </motion.div>
            )}

            {activePanel === "performance" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Diagnostic Performance Metrics
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PerformanceCard title="Easy Challenges Solved" value={gamifiedUser?.solved?.easy || 0} tone="text-green-400" />
                  <PerformanceCard title="Medium Challenges Solved" value={gamifiedUser?.solved?.medium || 0} tone="text-amber-400" />
                  <PerformanceCard title="Hard Challenges Solved" value={gamifiedUser?.solved?.hard || 0} tone="text-red-400" />
                  <PerformanceCard title="Accuracy Rate" value={`${gamifiedUser.accuracy || 0}%`} tone="text-white" />
                  <PerformanceCard title="Roadmaps Completed" value={stats.completedRoadmaps} tone="text-[var(--primary)]" />
                  <PerformanceCard title="Resources Completed" value={stats.completedResources} tone="text-white" />
                  <PerformanceCard title="Accepted Submissions" value={stats.acceptedSubmissions} tone="text-white" />
                  <PerformanceCard title="Total Attempts" value={stats.totalSubmissions} tone="text-gray-300" />
                </div>
              </motion.div>
            )}

            {activePanel === "classroom" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Academic Classroom
                  </h3>
                </div>

                {fullCourses.length ? (
                  <div className="grid gap-4">
                    {fullCourses.map((course) => (
                      <div
                        key={course._id}
                        className="p-5 bg-black border border-gray-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[rgba(250,204,21,0.25)] transition-all duration-300"
                      >
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-2">
                            Active Course
                          </div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wide">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-2 max-w-2xl">
                            {course.description || "Structured learning path currently active in your classroom."}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/courses/${course._id}/learn`)}
                          className="w-full sm:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--primary)] text-black hover:bg-amber-400 rounded-lg transition-all duration-300"
                        >
                          Continue Learning
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel text="No active course enrolments found." />
                )}
              </motion.div>
            )}

            {activePanel === "mentorships" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Active Mentorship Subscriptions
                  </h3>
                </div>

                {enrolledMentorships.length ? (
                  <div className="grid gap-4">
                    {enrolledMentorships.map((entry) => (
                      <div
                        key={entry._id}
                        className="p-5 bg-black border border-gray-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[rgba(250,204,21,0.25)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={entry.mentorImage || "/default-avatar.png"}
                            alt="Mentor"
                            className="w-12 h-12 rounded-full border border-gray-800 bg-black object-cover"
                          />
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">
                              {entry.mentorName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold text-amber-300/80 bg-black/60 border border-[rgba(250,204,21,0.15)] px-2 py-0.5 rounded">
                                {entry.planTitle}
                              </span>
                              <span className="text-[9px] text-gray-500 font-bold uppercase">
                                Ends: {new Date(entry.endingDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/mentorship/${entry.mentor}/${entry.planId}`)}
                          className="w-full sm:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--primary)] text-black hover:bg-amber-400 rounded-lg transition-all duration-300"
                        >
                          Go to Workspace
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel text="No active mentorship subscriptions registered." />
                )}
              </motion.div>
            )}

            {activePanel === "certs" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-gray-900 bg-[#07070a]/95 relative"
              >
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
                <div className="flex items-center gap-2 mb-6 border-b border-gray-950 pb-4">
                  <span className="text-xs text-[var(--primary)]">◈</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Earned Credentials
                  </h3>
                </div>

                {certificates.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((certificate) => (
                      <div
                        key={certificate._id}
                        className="relative rounded-xl p-4 bg-black border border-gray-900 hover:border-[var(--primary)] transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-2">
                            Verified Certificate
                          </div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wide leading-relaxed">
                            {certificate.roadmapName || "AlgoVista Certificate"}
                          </h4>
                          <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest">
                            ID: {certificate.certificateId || certificate._id}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-950">
                          <button
                            onClick={() => setPreviewCertId(certificate.certificateId)}
                            className="flex-1 text-[9px] font-black uppercase tracking-widest py-2 bg-black border border-gray-900 text-gray-400 hover:text-white rounded"
                          >
                            <EyeOutlined className="mr-1" /> View
                          </button>

                          <button
                            onClick={() => handleDownload(certificate.certificateId)}
                            className="flex-1 text-[9px] font-black uppercase tracking-widest py-2 bg-[var(--primary)] text-black rounded"
                          >
                            <DownloadOutlined className="mr-1" /> Get PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel text="No verified credentials unlocked yet." />
                )}

                {previewCertId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative rounded-2xl border border-gray-900 bg-black p-5 w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-gray-950 pb-3 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                          ◈ Certificate Viewer
                        </span>
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
        </section>
      </main>
    </div>
  );
};

const ProgressRing = ({ size = 110, progress = 40, level = 1 }) => {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.02)"
          strokeWidth={stroke}
          fill="transparent"
        />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Level</div>
        <div className="text-2xl font-black text-white mt-0.5 leading-none">{level}</div>
      </div>
    </div>
  );
};

const MetricBadge = ({ icon, label, sub }) => (
  <div className="flex flex-col items-center justify-center bg-black border border-gray-950 p-3.5 rounded-xl text-center">
    <div className="text-[var(--primary)] text-sm mb-1">{icon}</div>
    <div className="text-xs font-black text-white tracking-wide">{label}</div>
    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">{sub}</div>
  </div>
);

const MiniTile = ({ title, value }) => (
  <div className="relative p-4 rounded-xl bg-black border border-gray-950 overflow-hidden text-center">
    <div className="absolute top-1 left-1 w-1 h-1 border-t border-l border-[var(--primary)] opacity-20"></div>
    <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1.5">{title}</div>
    <div className="text-sm font-black text-white tracking-wider">{value}</div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="p-4 rounded-xl bg-black border border-gray-950">
    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">{title}</h4>
    <div style={{ height: 220 }}>{children}</div>
  </div>
);

const StatPill = ({ icon, label }) => (
  <div className="px-3 py-2 rounded-xl bg-black border border-gray-900 text-[10px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-2">
    <span className="text-[var(--primary)]">{icon}</span>
    <span>{label}</span>
  </div>
);

const InsightRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-950 bg-[#07070a] px-4 py-3">
    <div className="flex items-center gap-3 text-xs text-gray-300">
      <span className="text-[var(--primary)]">{icon}</span>
      <span className="font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-sm font-black text-white">{value}</div>
  </div>
);

const PerformanceCard = ({ title, value, tone = "text-white" }) => (
  <div className="p-4 bg-black border border-gray-900 rounded-xl">
    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{title}</div>
    <div className={`text-2xl font-black ${tone}`}>{value}</div>
  </div>
);

const EmptyPanel = ({ text }) => (
  <div className="rounded-xl border border-dashed border-gray-950 p-10 text-center text-xs font-bold uppercase tracking-widest text-gray-600">
    {text}
  </div>
);

export default Dashboard;
