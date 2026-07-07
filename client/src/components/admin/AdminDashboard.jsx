"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  MenuOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  MessageOutlined,
  SendOutlined,
  CrownOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Skeleton, message, Avatar, Tag, Button, Input, Modal, Progress } from "antd";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";
import Context from "../../util/context";
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, sessionLoading } = useContext(Context);

  const planFilter = new URLSearchParams(location.search).get("plan");

  const [stats] = useState({
    roadmaps: 14,
    questions: 92,
    learners: 540,
  });

  // Mentees states
  const [mentorships, setMentorships] = useState([]);
  const [activeChatMentorship, setActiveChatMentorship] = useState(null);

  // Chat states
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const chatBottomRef = useRef(null);

  // Filtered Mentees
  const filteredMentorships = React.useMemo(() => {
    if (!planFilter) return mentorships;
    return mentorships.filter(
      (m) => m.planSnapshot?.title?.toLowerCase() === planFilter.toLowerCase()
    );
  }, [mentorships, planFilter]);

  /* -------------------- Guards -------------------- */
  useEffect(() => {
    if (!sessionLoading) {
      if (!session) {
        navigate("/login");
      } else if (session?.role !== "admin") {
        message.error("Access denied! Admins only.");
        navigate("/");
      }
    }
  }, [session, sessionLoading, navigate]);

  /* -------------------- Fetch Mentees -------------------- */
  useEffect(() => {
    if (session && session.role === "admin") {
      fetchMentees();
    }
  }, [session]);

  const fetchMentees = async () => {
    try {
      // Fetch all mentorship plans active for this mentor directly using their user ID
      const mentorshipsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/mentorship?mentorId=${session.id}`,
        { withCredentials: true }
      );
      setMentorships(mentorshipsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch mentees:", err);
    }
  };

  /* -------------------- Sockets Chat Engine -------------------- */
  useEffect(() => {
    if (activeChatMentorship?._id) {
      fetchChatHistory(activeChatMentorship._id);

      socketRef.current = io(`${import.meta.env.VITE_API_URL}`);

      socketRef.current.emit("join_room", activeChatMentorship._id);

      socketRef.current.on("receive_message", (message) => {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [activeChatMentorship]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchChatHistory = async (mentorshipId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mentorship/${mentorshipId}/messages`,
        { withCredentials: true }
      );
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim() || !socketRef.current || !activeChatMentorship) return;
    try {
      socketRef.current.emit("send_message", {
        mentorshipId: activeChatMentorship._id,
        senderId: session.id,
        senderRole: "mentor",
        text: newMessageText,
      });
      setNewMessageText("");
    } catch (err) {
      console.error("Failed to dispatch message:", err);
    }
  };

  if (sessionLoading || !session) {
    return (
      <div className="flex min-h-screen bg-black text-white font-mono overflow-hidden">
        <aside className="w-64 bg-gray-900 border-r border-gray-700 p-6 flex flex-col gap-6">
          <Skeleton.Avatar active size={64} shape="circle" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </aside>
        <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
          <Skeleton.Input
            active
            size="large"
            style={{ width: "40%", marginBottom: "1.5rem" }}
          />
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const chartData = [
    { name: "Jan", Roadmaps: 3, Questions: 12, Learners: 50 },
    { name: "Feb", Roadmaps: 4, Questions: 15, Learners: 80 },
    { name: "Mar", Roadmaps: 5, Questions: 20, Learners: 120 },
    { name: "Apr", Roadmaps: 7, Questions: 28, Learners: 200 },
    { name: "May", Roadmaps: 8, Questions: 30, Learners: 280 },
    { name: "Jun", Roadmaps: 10, Questions: 35, Learners: 350 },
  ];

  return (
    <div className="min-h-screen flex bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Decorative background grid ambient */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>

      {/* Sidebar */}
      <AdminSidebar session={session} open={open} setOpen={setOpen} />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 relative z-10 font-mono overflow-y-auto max-h-screen">
        
        {/* Mobile Menu Button & Title */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-900 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
              Admin Portal
            </h1>
            <p className="text-xs text-[var(--primary)] mt-1">Platform Diagnostics & Mentor Control Center</p>
          </div>
          <button onClick={() => setOpen(true)} className="md:hidden text-white text-2xl">
            <MenuOutlined />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Total Roadmaps", value: stats.roadmaps },
            { title: "Total Questions", value: stats.questions },
            { title: "Active Learners", value: stats.learners },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl border border-[rgba(250,204,21,0.08)] bg-[#07070a]/95 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{item.title}</h3>
              <p className="text-3xl font-black text-white mt-2 tracking-tight">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* MENTEES / SECURE CHATS SECTION */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8 border-b border-gray-900 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Active Mentorship Mentees
              </h3>
              {planFilter && (
                <span className="text-[9px] text-black font-black uppercase tracking-widest bg-[var(--primary)] px-2.5 py-1 rounded flex items-center gap-1.5 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                  <CrownOutlined /> {planFilter} plan
                  <button onClick={() => navigate("/admin/dashboard")} className="ml-1 text-black hover:text-red-700 font-extrabold transition-colors">✕</button>
                </span>
              )}
            </div>
            <span className="text-[9px] text-[var(--primary)] font-bold uppercase tracking-wider bg-black/60 border border-[rgba(250,204,21,0.2)] px-3 py-1 rounded-md">
              {filteredMentorships.length} Contracts
            </span>
          </div>

          {filteredMentorships.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-800 rounded-2xl bg-[#07070a]">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">No active mentees enrolled under this plan yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentorships.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/admin/mentorship/${m._id}`)}
                  className="group relative overflow-hidden rounded-2xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/95 p-6 hover:border-[var(--primary)] transition-all duration-300 cursor-pointer"
                >
                  {/* Decorative Tech Corners */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[var(--primary)] opacity-40"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--primary)] opacity-40"></div>

                  <div className="flex items-center gap-4 mb-4">
                    <Avatar
                      src={m.user?.profileImage}
                      size={48}
                      className="border border-[rgba(250,204,21,0.2)] bg-black"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white tracking-wide uppercase">
                        {m.user?.fullname || "Enrolled Student"}
                      </h4>
                      <p className="text-[10px] text-gray-500 tracking-wider lowercase">{m.user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-950 pt-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Tier Plan</span>
                      <span className="text-amber-400 font-black flex items-center gap-1">
                        <CrownOutlined /> {m.planSnapshot?.title || "ADVANCED"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`${m.status === "active" ? "text-green-400" : "text-red-500"} flex items-center gap-1 font-black`}>
                        <CheckCircleOutlined /> {m.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-gray-300 flex items-center gap-1">
                        <CalendarOutlined /> {new Date(m.endingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {m.status === "active" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/mentorship/${m._id}`);
                      }}
                      className="mt-6 w-full py-2.5 rounded-xl bg-[var(--primary)] hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[9px] transition-colors duration-300 flex items-center justify-center gap-1.5"
                    >
                      <MessageOutlined /> Open Workspace
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/mentorship/${m._id}`);
                      }}
                      className="mt-6 w-full py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-gray-500 hover:text-white transition-colors font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5"
                    >
                      View Details
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#07070a]/95 border border-[rgba(250,204,21,0.08)] rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-900 pb-3">
            Platform Growth & Interaction Analytics
          </h2>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" />
              <XAxis dataKey="name" stroke="#555" style={{ fontSize: 10, fontFamily: "monospace" }} />
              <YAxis stroke="#555" style={{ fontSize: 10, fontFamily: "monospace" }} />
              <ChartTooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #222", color: "#fff", fontFamily: "monospace" }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace", color: "#999" }} />
              <Bar dataKey="Roadmaps" fill="rgba(250,204,21,0.8)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Questions" fill="#333" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </main>

      {/* ================= ADMIN REAL-TIME SECURE CHAT MODAL ================= */}
      <Modal
        open={!!activeChatMentorship}
        onCancel={() => setActiveChatMentorship(null)}
        footer={null}
        width={750}
        className="futuristic-modal"
        style={{ top: 80 }}
        destroyOnClose
      >
        {activeChatMentorship && (
          <div className="font-mono bg-black text-gray-200 p-4">
            <div className="border-b border-gray-900 pb-3 mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={activeChatMentorship.user?.profileImage}
                  size={32}
                  className="border border-[rgba(250,204,21,0.2)] bg-black"
                />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Secure Channel: {activeChatMentorship.user?.fullname}
                  </span>
                  <p className="text-[8px] text-[var(--primary)] uppercase font-bold tracking-widest mt-0.5">
                    {activeChatMentorship.planSnapshot?.title} Member Contract
                  </p>
                </div>
              </div>
              
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider bg-black border border-gray-900 px-3 py-1 rounded-md">
                End-To-End Socket Terminal
              </span>
            </div>

            {/* Messages body */}
            <div className="h-96 overflow-y-auto flex flex-col gap-3 pr-2 mb-4 bg-[#07070a] border border-gray-950 p-4 rounded-2xl">
              {messages.length === 0 ? (
                <div className="text-center italic text-gray-600 text-xs my-auto font-bold uppercase tracking-wider">
                  No active telemetry messages recorded. Dispatch standard message to student.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[75%] p-3 rounded-2xl ${
                      m.senderRole === "mentor"
                        ? "bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.15)] self-end"
                        : "bg-gray-950 border border-gray-900 self-start"
                    }`}
                  >
                    <span className={`text-[8px] font-black uppercase tracking-wider mb-1 ${
                      m.senderRole === "mentor" ? "text-[var(--primary)]" : "text-amber-500"
                    }`}>
                      {m.senderRole === "mentor" ? "You (Mentor)" : activeChatMentorship.user?.fullname}
                    </span>
                    <p className="text-xs leading-relaxed text-gray-200">{m.text}</p>
                    <span className="text-[8px] text-gray-600 mt-1 self-end">{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Footer */}
            <div className="flex gap-2">
              <Input
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onPressEnter={handleSendMessage}
                placeholder="Type real-time message response to your mentee..."
                className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl !shadow-none font-mono text-xs"
              />
              <button
                onClick={handleSendMessage}
                className="px-5 bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-1.5"
              >
                <SendOutlined /> Send
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
