"use client";
import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Avatar,
  Button,
  Tag,
  Spin,
  Card,
  Tooltip,
  Progress,
  Input,
  DatePicker,
  TimePicker,
  Modal,
  Popover,
  Tabs,
} from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  StarFilled,
  ArrowLeftOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TrophyOutlined,
  RocketOutlined,
  SendOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  PlusOutlined,
  GlobalOutlined,
  PaperClipOutlined,
  SmileOutlined,
  DeleteOutlined,
  PictureOutlined,
  FolderOpenOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Context from "../util/context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";

const API = "http://localhost:4000";
const GROUP_ROOM_ID = "696e640ad1839372fa975000";
const TECH_EMOJIS = ["💻", "🚀", "💡", "🔥", "✅", "❌", "👏", "💯", "👍", "🙌", "🎯", "📝", "📊", "🧠", "✨", "🎉", "👨‍💻", "👑"];

const MentorshipDetails = () => {
  const { mentorId, planId } = useParams();
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);

  const [mentor, setMentor] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMentorship, setUserMentorship] = useState(null);

  // Socket reference
  const socketRef = useRef(null);

  // Workspace sub-panel state
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");

  const parseMessageText = (rawText) => {
    try {
      if (rawText.startsWith("{") && rawText.endsWith("}")) {
        const parsed = JSON.parse(rawText);
        if (parsed.text !== undefined || parsed.media !== undefined) {
          return parsed;
        }
      }
    } catch (e) {}
    return { text: rawText };
  };

  const extractMediaFiles = (msgs) => {
    return msgs
      .map((m) => parseMessageText(m.text).media)
      .filter((media) => media !== null && media !== undefined);
  };

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const chatBottomRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Group Chat state
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupText, setNewGroupText] = useState("");
  const [showGroupEmojiPicker, setShowGroupEmojiPicker] = useState(false);
  const [selectedGroupFile, setSelectedGroupFile] = useState(null);
  const groupFileInputRef = useRef(null);
  const groupChatBottomRef = useRef(null);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionTime, setNewSessionTime] = useState("");
  const [newSessionTopic, setNewSessionTopic] = useState("");

  // Submissions (Projects / Resumes) state
  const [submissions, setSubmissions] = useState([]);
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubLink, setNewSubLink] = useState("");
  const [newSubNotes, setNewSubNotes] = useState("");

  // Mock Interviews state
  const [mockRunning, setMockRunning] = useState(false);
  const [mockResult, setMockResult] = useState(null);

  // Resources state
  const [resources, setResources] = useState([]);

  // Socket room connection hook
  useEffect(() => {
    if (userMentorship?._id) {
      socketRef.current = io("http://localhost:4000");

      socketRef.current.emit("join_room", userMentorship._id);
      socketRef.current.emit("join_room", GROUP_ROOM_ID);

      socketRef.current.on("receive_message", (message) => {
        if (message.mentorshipId === GROUP_ROOM_ID) {
          setGroupMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        } else {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
      });

      socketRef.current.on("message_deleted", ({ messageId }) => {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        setGroupMessages((prev) => prev.filter((m) => m._id !== messageId));
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [userMentorship]);

  /* -------------------- Guards -------------------- */
  useEffect(() => {
    if (!session && !sessionLoading) navigate("/login");
  }, [session, sessionLoading, navigate]);

  /* -------------------- Fetch Core Data -------------------- */
  useEffect(() => {
    if (session) {
      fetchMentor();
      fetchUserMentorship();
    }
  }, [session]);

  const fetchMentor = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentor-details/${mentorId}`,
        { withCredentials: true }
      );

      const mentorObj = Array.isArray(data) ? data[0] : data;
      setMentor(mentorObj);

      const plan = mentorObj?.plans?.find((p) => p._id === planId);
      setActivePlan(plan || null);
    } catch (err) {
      console.error("Fetch mentor failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMentorship = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentorship?mentorId=${mentorId}&userId=${session.id}`,
        { withCredentials: true }
      );
      setUserMentorship(data?.[0] || null);
    } catch (err) {
      console.error("Fetch mentorship failed:", err);
    }
  };

  const hasAccess = userMentorship?.planId === planId && userMentorship?.status === "active";

  /* -------------------- Fetch Workspace Sub-Data -------------------- */
  useEffect(() => {
    if (!userMentorship?._id) return;

    if (activeWorkspace === "chat") {
      fetchMessages();
      fetchGroupMessages();
    } else if (activeWorkspace === "sessions") {
      fetchSessions();
    } else if (activeWorkspace === "projects" || activeWorkspace === "resumes") {
      fetchSubmissions();
    } else if (activeWorkspace === "resources") {
      fetchResources();
    }
  }, [activeWorkspace, userMentorship]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (groupChatBottomRef.current) {
      groupChatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  // Messages APIs
  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentorship/${userMentorship._id}/messages`,
        { withCredentials: true }
      );
      setMessages(data);
    } catch (err) {
      console.error("Fetch messages failed:", err);
    }
  };

  const fetchGroupMessages = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentorship/${GROUP_ROOM_ID}/messages`,
        { withCredentials: true }
      );
      setGroupMessages(data);
    } catch (err) {
      console.error("Fetch group messages failed:", err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim() && !selectedFile) return;
    if (!socketRef.current) return;
    
    try {
      const messagePayload = {
        text: newMessageText,
        media: selectedFile ? {
          name: selectedFile.name,
          type: selectedFile.type,
          dataUrl: selectedFile.dataUrl,
        } : null
      };

      socketRef.current.emit("send_message", {
        mentorshipId: userMentorship._id,
        senderId: session.id,
        senderRole: "user",
        text: JSON.stringify(messagePayload),
      });

      setNewMessageText("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
    } catch (err) {
      toast.error("Failed to dispatch message");
    }
  };

  const handleSendGroupMessage = () => {
    if (!newGroupText.trim() && !selectedGroupFile) return;
    if (!socketRef.current) return;

    try {
      const messagePayload = {
        text: newGroupText,
        media: selectedGroupFile ? {
          name: selectedGroupFile.name,
          type: selectedGroupFile.type,
          dataUrl: selectedGroupFile.dataUrl,
        } : null
      };

      socketRef.current.emit("send_message", {
        mentorshipId: GROUP_ROOM_ID,
        senderId: session.id,
        senderRole: "user",
        text: JSON.stringify(messagePayload),
      });

      setNewGroupText("");
      setSelectedGroupFile(null);
      setShowGroupEmojiPicker(false);
    } catch (err) {
      toast.error("Send group message error");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API}/mentorship/messages/${messageId}`, {
        withCredentials: true,
      });
      // Emit socket event to notify other clients in real-time
      if (socketRef.current) {
        socketRef.current.emit("delete_message", {
          room: userMentorship?._id,
          messageId,
        });
        socketRef.current.emit("delete_message", {
          room: GROUP_ROOM_ID,
          messageId,
        });
      }
      // Locally update state
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setGroupMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Message deleted successfully");
    } catch (err) {
      console.error("Delete message failed:", err);
      toast.error("Failed to delete message");
    }
  };

  const handleFileChange = (e, isGroup = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large! Maximum allowed size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileData = {
        name: file.name,
        type: file.type,
        dataUrl: reader.result,
      };
      if (isGroup) {
        setSelectedGroupFile(fileData);
      } else {
        setSelectedFile(fileData);
      }
      toast.success(`Attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Sessions APIs
  const fetchSessions = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentorship/${userMentorship._id}/sessions`,
        { withCredentials: true }
      );
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSession = async () => {
    if (!newSessionDate || !newSessionTime || !newSessionTopic.trim()) {
      toast.warn("Please complete all call schedule fields");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API}/mentorship/${userMentorship._id}/sessions`,
        {
          date: newSessionDate,
          time: newSessionTime,
          topic: newSessionTopic,
        },
        { withCredentials: true }
      );
      setSessions((prev) => [...prev, data]);
      setNewSessionDate("");
      setNewSessionTime("");
      setNewSessionTopic("");
      toast.success("1-on-1 session successfully scheduled!");
    } catch (err) {
      toast.error("Failed to book session");
    }
  };

  // Submissions APIs
  const fetchSubmissions = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentorship/${userMentorship._id}/submissions`,
        { withCredentials: true }
      );
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (type) => {
    if (!newSubTitle.trim() || !newSubLink.trim()) {
      toast.warn("Please complete all submission parameters");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API}/mentorship/${userMentorship._id}/submissions`,
        {
          type,
          title: newSubTitle,
          link: newSubLink,
          notes: newSubNotes,
        },
        { withCredentials: true }
      );
      setSubmissions((prev) => [data, ...prev]);
      setNewSubTitle("");
      setNewSubLink("");
      setNewSubNotes("");
      toast.success(`${type === "project" ? "Project" : "Resume"} uploaded for mentor review!`);
    } catch (err) {
      toast.error("Failed to register submission");
    }
  };

  // Resources APIs
  const fetchResources = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentorship/${userMentorship._id}/resources`,
        { withCredentials: true }
      );
      setResources(data || []);
    } catch (err) {
      console.error("Fetch resources failed:", err);
    }
  };

  // Mock assessment runner
  const handleStartMock = () => {
    setMockRunning(true);
    setMockResult(null);
    setTimeout(() => {
      setMockRunning(false);
      setMockResult({
        score: "85%",
        verdict: "Strong Hire",
        feedback: "Excellent algorithmic knowledge. Work slightly more on direct system-design structures.",
        qa: [
          { q: "Explain Big O complexity of Heapify.", a: "O(N) due to aggregate structural bounds." },
          { q: "Design a rate limiter.", a: "Used token bucket strategy with Redis backend." },
        ],
      });
    }, 3000);
  };

  if (loading || !mentor || !activePlan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
      
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 pt-28 relative z-10 font-mono">
        
        {/* ================= TOP COMMAND BAR ================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="!bg-black/60 !border-[rgba(250,204,21,0.25)] !text-gray-300 hover:!text-[var(--primary)] hover:!border-[var(--primary)] h-10 w-10 rounded-xl flex items-center justify-center"
            />
            <div>
              <h1 className="text-xl font-black text-white tracking-wide leading-none">
                Mentorship Workspace
              </h1>
              <p className="text-xs text-[var(--primary)] mt-1">
                {mentor.fullname} · {activePlan.title} Tier
              </p>
            </div>
          </div>

          {hasAccess ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.3)] text-[var(--primary)] text-xs font-black tracking-widest uppercase">
              <CheckCircleOutlined />
              ACTIVE SUBSCRIPTION
            </div>
          ) : (
            <div className="px-4 py-2 rounded-full border border-gray-800 text-xs text-gray-500 font-bold uppercase tracking-wider">
              LIMITED ACCESS
            </div>
          )}
        </div>

        {/* ================= HERO GLASS PANEL ================= */}
        <div className="relative overflow-hidden rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-8 md:p-10 mb-10 shadow-[0_0_50px_rgba(250,204,21,0.03)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.02),_transparent_60%)] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row gap-12 justify-between items-start">
            {/* LEFT */}
            <div className="flex flex-col sm:flex-row gap-7 items-center sm:items-start text-center sm:text-left">
              <div className="relative">
                <Avatar
                  size={104}
                  src={mentor.profileImage}
                  className="border border-[rgba(250,204,21,0.2)] bg-black shadow-lg"
                />
                {mentor.isAvailable && (
                  <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-black animate-pulse" />
                )}
              </div>

              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {mentor.fullname || "Mentor"}
                </h2>
                <p className="text-gray-400 mt-1 text-sm">
                  {activePlan.title} Mentorship
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 mt-4 text-xs md:text-sm text-gray-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <StarFilled className="text-[var(--primary)]" />
                    <span className="text-white">{mentor.averageRating || 4.5} rating</span>
                  </span>

                  <span>
                    <span className="text-white">{mentor.noOfMentees}</span>/{mentor.maximumNoOfMentees} Mentees Active
                  </span>

                  <span className={mentor.isAvailable ? "text-green-400" : "text-red-400"}>
                    {mentor.isAvailable ? "Available" : "Busy"}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-6">
                  {mentor.specializations?.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold text-amber-300/80 bg-black/60 border border-[rgba(250,204,21,0.15)] px-3 py-1 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — PLAN GLASS CARD */}
            <div className="w-full lg:w-[360px] relative overflow-hidden rounded-2xl border border-[rgba(250,204,21,0.15)] bg-black/70 p-7 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.03),_transparent_60%)] pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  <CrownOutlined className="text-[var(--primary)]" />
                  PLAN DETAILS
                </div>

                <h3 className="mt-3 text-2xl font-black text-white uppercase tracking-wide">
                  {activePlan.title}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  ₹{activePlan.price} · {activePlan.duration} days
                </p>

                <div className="mt-5 flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
                  <span>Plan Usage</span>
                  <span className={hasAccess ? "text-[var(--primary)]" : "text-gray-500"}>
                    {hasAccess ? "Active" : "Inactive"}
                  </span>
                </div>

                <Progress
                  percent={hasAccess ? 100 : 35}
                  showInfo={false}
                  strokeWidth={6}
                  trailColor="#111"
                  strokeColor="var(--primary)"
                  className="mt-2"
                />

                {hasAccess ? (
                  <div className="mt-6 flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircleOutlined />
                    Full access enabled
                  </div>
                ) : userMentorship?.status === "expired" ? (
                  <div className="mt-6">
                    <div className="text-red-500 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      Subscription Expired
                    </div>
                    <button
                      className="w-full btn-yellow py-3 text-xs font-bold uppercase tracking-wider"
                      onClick={() => navigate(`/mentor/${mentorId}`)}
                    >
                      Renew Plan
                    </button>
                  </div>
                ) : (
                  <button
                    className="mt-6 w-full btn-yellow py-3 text-xs font-bold uppercase tracking-wider"
                    onClick={() => navigate(`/mentor/${mentorId}`)}
                  >
                    Buy Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= METRIC STRIP ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Mentorship Sessions"
            value={activePlan.title === "ADVANCED" ? "Unlimited" : "12 / month"}
            icon={<CalendarOutlined />}
          />
          <StatCard
            label="Response Time"
            value={activePlan.title === "ADVANCED" ? "< 2 hrs" : "< 12 hrs"}
            icon={<ThunderboltOutlined />}
          />
          <StatCard
            label="Success Rate"
            value="94%"
            icon={<TrophyOutlined />}
          />
          <StatCard
            label="Career Boost"
            value="+63%"
            icon={<RocketOutlined />}
          />
        </div>

        {/* ================= FEATURE ACCESS ================= */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <FeaturePanel
            title="Included Privileges"
            items={activePlan.whatCanDo}
            type="allowed"
          />
          <FeaturePanel
            title="Restricted Elements"
            items={activePlan.whatCannotDo}
            type="locked"
          />
        </div>

        {/* ================= MODULE WORKSPACE ================= */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-8 border-b border-gray-900 pb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Mentorship Workspace Modules
            </h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-black/60 border border-gray-800 px-3 py-1 rounded-full">
              Access based on active tier
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <WorkspaceCard
              title="1-on-1 Sessions"
              description="Schedule private 1-on-1 calls with your mentor for personalized reviews."
              icon={<CalendarOutlined />}
              enabled={hasAccess && activePlan.title !== "BASIC"}
              cta="Schedule Call"
              onClick={() => setActiveWorkspace("sessions")}
            />

            <WorkspaceCard
              title="Mentor Chat"
              description="Direct high-priority async channel with your mentor."
              icon={<MessageOutlined />}
              enabled={hasAccess}
              cta="Open Chat"
              onClick={() => setActiveWorkspace("chat")}
            />

            <WorkspaceCard
              title="Learning Resources"
              description="Premium custom curations, engineering briefs, and roadmaps."
              icon={<FileTextOutlined />}
              enabled={hasAccess}
              cta="Explore"
              onClick={() => setActiveWorkspace("resources")}
            />

            <WorkspaceCard
              title="Project Reviews"
              description="High-fidelity design, architecture and code level feedback."
              icon={<RocketOutlined />}
              enabled={hasAccess && activePlan.title !== "BASIC"}
              cta="Submit Project"
              onClick={() => setActiveWorkspace("projects")}
            />

            <WorkspaceCard
              title="Resume Optimization"
              description="Industry standard professional CV, portfolio and LinkedIn analysis."
              icon={<ThunderboltOutlined />}
              enabled={hasAccess && activePlan.title !== "BASIC"}
              cta="Upload Resume"
              onClick={() => setActiveWorkspace("resumes")}
            />

            <WorkspaceCard
              title="Mock Interviews"
              description="Realistic interview simulation with actionable performance reports."
              icon={<TrophyOutlined />}
              enabled={hasAccess && activePlan.title === "ADVANCED"}
              cta="Start Mock"
              premium
              onClick={() => setActiveWorkspace("mocks")}
            />
          </div>
        </div>

        {/* ================= INTERACTIVE WORKSPACE MODAL ================= */}
        <Modal
          open={!!activeWorkspace}
          onCancel={() => setActiveWorkspace(null)}
          footer={null}
          width={800}
          className="futuristic-modal"
          style={{ top: 80 }}
          destroyOnClose
        >
          {/* Chat / Group Chat / Media Workspace */}
          {(activeWorkspace === "chat" || activeWorkspace === "group_chat") && (
            <div className="font-mono bg-[#050508] text-gray-200 p-4">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="premium-tabs"
                items={[
                  {
                    key: "chat",
                    label: (
                      <span className="text-xs uppercase font-black tracking-wider px-2">
                        <MessageOutlined /> Live Secure Chat
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-4">
                        {/* Messages Body */}
                        <div className="h-[450px] overflow-y-auto flex flex-col gap-3 pr-2 bg-black border border-gray-950 p-5 rounded-2xl">
                          {messages.length === 0 ? (
                            <div className="text-center italic text-gray-600 text-xs my-auto font-bold uppercase tracking-wider">
                              Secure mentorship terminal instantiated. Send a message.
                            </div>
                          ) : (
                            messages.map((m, idx) => {
                              const parsed = parseMessageText(m.text);
                              return (
                                <div key={idx} className={`flex items-center gap-2 group w-full ${m.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                                  {m.senderRole === "user" && (
                                    <Button
                                      icon={<DeleteOutlined className="text-red-500" />}
                                      onClick={() => handleDeleteMessage(m._id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity !bg-transparent !border-none !text-gray-500 hover:!text-red-500"
                                      size="small"
                                    />
                                  )}
                                  <div
                                    className={`flex flex-col max-w-[70%] p-4 rounded-2xl ${
                                      m.senderRole === "user"
                                        ? "bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.15)]"
                                        : "bg-gray-950 border border-gray-900"
                                    }`}
                                  >
                                    <span className={`text-[8px] font-black uppercase tracking-wider mb-1 ${
                                      m.senderRole === "user" ? "text-[var(--primary)]" : "text-amber-500"
                                    }`}>
                                      {m.senderRole === "user" ? "You" : mentor?.fullname}
                                    </span>

                                    {/* Text content */}
                                    {parsed.text && <p className="text-xs leading-relaxed text-gray-200">{parsed.text}</p>}

                                    {/* Media content */}
                                    {parsed.media && (
                                      <div className="mt-3 p-3 bg-black/80 border border-gray-900 rounded-xl flex flex-col gap-2 max-w-sm">
                                        {parsed.media.type.startsWith("image/") ? (
                                          <img
                                            src={parsed.media.dataUrl}
                                            alt={parsed.media.name}
                                            className="rounded-lg max-h-40 object-cover border border-gray-900"
                                          />
                                        ) : (
                                          <div className="flex items-center gap-2 text-amber-400">
                                            <FileTextOutlined className="text-xl" />
                                            <span className="text-[10px] font-bold truncate max-w-[180px]">{parsed.media.name}</span>
                                          </div>
                                        )}
                                        <a
                                          href={parsed.media.dataUrl}
                                          download={parsed.media.name}
                                          className="text-[8px] font-black uppercase tracking-widest text-[var(--primary)] hover:text-amber-400 self-end flex items-center gap-1 mt-1"
                                        >
                                          <LinkOutlined /> Download File
                                        </a>
                                      </div>
                                    )}

                                    <span className="text-[8px] text-gray-600 mt-1 self-end">{new Date(m.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  {m.senderRole !== "user" && (
                                    <Button
                                      icon={<DeleteOutlined className="text-red-500" />}
                                      onClick={() => handleDeleteMessage(m._id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity !bg-transparent !border-none !text-gray-500 hover:!text-red-500"
                                      size="small"
                                    />
                                  )}
                                </div>
                              );
                            })
                          )}
                          <div ref={chatBottomRef} />
                        </div>

                        {/* Rich Media Previews above Input bar */}
                        {selectedFile && (
                          <div className="p-3 bg-gray-950 border border-gray-900 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {selectedFile.type.startsWith("image/") ? (
                                <img src={selectedFile.dataUrl} className="w-8 h-8 rounded object-cover border border-gray-800" />
                              ) : (
                                <FileTextOutlined className="text-xl text-amber-500" />
                              )}
                              <div>
                                <span className="text-[10px] text-white font-bold block">{selectedFile.name}</span>
                                <span className="text-[8px] text-gray-500 uppercase block">{selectedFile.type || "unknown type"}</span>
                              </div>
                            </div>
                            <Button
                              icon={<CloseOutlined />}
                              size="small"
                              onClick={() => setSelectedFile(null)}
                              className="!bg-transparent !border-none !text-gray-500 hover:!text-red-500"
                            />
                          </div>
                        )}

                        {/* Chat Input */}
                        {userMentorship?.status === "active" ? (
                          <div className="flex items-center gap-2 bg-[#050508] border border-gray-950 p-2.5 rounded-2xl">
                            {/* Hidden File Upload Element */}
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={(e) => handleFileChange(e, false)}
                            />

                            {/* Paperclip Media Upload Trigger */}
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="h-10 w-10 rounded-xl border border-gray-900 bg-black hover:border-[var(--primary)] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                            >
                              <PaperClipOutlined className="text-sm" />
                            </button>

                            {/* Custom Emojis Trigger */}
                            <Popover
                              open={showEmojiPicker}
                              onOpenChange={setShowEmojiPicker}
                              trigger="click"
                              placement="top"
                              content={
                                <div className="grid grid-cols-6 gap-2 p-2 bg-black border border-gray-900 rounded-xl max-w-[220px]">
                                  {TECH_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        setNewMessageText((prev) => prev + emoji);
                                        setShowEmojiPicker(false);
                                      }}
                                      className="text-base p-1.5 hover:bg-gray-900 rounded-lg transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              }
                            >
                              <button className="h-10 w-10 rounded-xl border border-gray-900 bg-black hover:border-[var(--primary)] text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                                <SmileOutlined className="text-sm" />
                              </button>
                            </Popover>

                            <Input
                              value={newMessageText}
                              onChange={(e) => setNewMessageText(e.target.value)}
                              onPressEnter={handleSendMessage}
                              placeholder="Type secure reply message..."
                              className="!bg-black !text-white !border-none focus:!border-none !shadow-none font-mono text-xs h-10 flex-1"
                            />
                            <button
                              onClick={handleSendMessage}
                              className="h-10 px-6 bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <SendOutlined /> Send
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-950 border border-gray-900 text-gray-500 text-xs font-bold uppercase rounded-xl">
                            Features Locked: Mentorship Subscription Expired
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "media_manager",
                    label: (
                      <span className="text-xs uppercase font-black tracking-wider px-2">
                        <FolderOpenOutlined /> Media Manager
                      </span>
                    ),
                    children: (
                      <div className="space-y-8 pt-4">
                        {/* 1. PERSONAL CHAT ATTACHMENTS */}
                        <div>
                          <h4 className="text-xs font-black uppercase text-[var(--primary)] tracking-wider border-b border-gray-900 pb-2 mb-4 flex items-center gap-2">
                            <MessageOutlined /> Personal Chat Attachments ({extractMediaFiles(messages).length})
                          </h4>
                          {extractMediaFiles(messages).length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-gray-950 text-xs text-gray-500 font-bold uppercase rounded-2xl">
                              No personal chat attachments shared in this secure channel.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {extractMediaFiles(messages).map((file, idx) => (
                                <div key={idx} className="p-4 bg-black border border-gray-950 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
                                  <div className="aspect-video w-full rounded-lg bg-gray-950 border border-gray-900 overflow-hidden flex items-center justify-center mb-3">
                                    {file.type.startsWith("image/") ? (
                                      <img src={file.dataUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <FileTextOutlined className="text-2xl text-amber-500" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-white font-bold block truncate">{file.name}</span>
                                    <span className="text-[8px] text-gray-500 block uppercase mt-0.5">{file.type}</span>
                                  </div>
                                  <a
                                    href={file.dataUrl}
                                    download={file.name}
                                    className="mt-4 px-3 py-1.5 border border-gray-900 hover:border-[var(--primary)] text-gray-400 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest text-center transition-colors"
                                  >
                                    Download File
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 2. GROUP LOUNGE BROADCAST ATTACHMENTS */}
                        <div>
                          <h4 className="text-xs font-black uppercase text-[var(--primary)] tracking-wider border-b border-gray-900 pb-2 mb-4 flex items-center gap-2">
                            <GlobalOutlined /> Group Lounge Broadcasts ({extractMediaFiles(groupMessages).length})
                          </h4>
                          {extractMediaFiles(groupMessages).length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-gray-950 text-xs text-gray-500 font-bold uppercase rounded-2xl">
                              No global group chat broadcasts shared yet.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {extractMediaFiles(groupMessages).map((file, idx) => (
                                <div key={idx} className="p-4 bg-black border border-gray-950 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
                                  <div className="aspect-video w-full rounded-lg bg-gray-950 border border-gray-900 overflow-hidden flex items-center justify-center mb-3">
                                    {file.type.startsWith("image/") ? (
                                      <img src={file.dataUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <FileTextOutlined className="text-2xl text-amber-500" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-white font-bold block truncate">{file.name}</span>
                                    <span className="text-[8px] text-gray-500 block uppercase mt-0.5">{file.type}</span>
                                  </div>
                                  <a
                                    href={file.dataUrl}
                                    download={file.name}
                                    className="mt-4 px-3 py-1.5 border border-gray-900 hover:border-[var(--primary)] text-gray-400 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest text-center transition-colors"
                                  >
                                    Download File
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "group_chat",
                    label: (
                      <span className="text-xs uppercase font-black tracking-wider px-2">
                        <GlobalOutlined /> Live Group Chat
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-4">
                        {/* Group Chat Messages Body */}
                        <div className="h-[450px] overflow-y-auto flex flex-col gap-3 pr-2 bg-black border border-gray-950 p-5 rounded-2xl">
                          {groupMessages.length === 0 ? (
                            <div className="text-center italic text-gray-600 text-xs my-auto font-bold uppercase tracking-wider">
                              Welcome to the Global Mentorship Lounge! Drop a broadcast message to all peers.
                            </div>
                          ) : (
                            groupMessages.map((m, idx) => {
                              const parsed = parseMessageText(m.text);
                              return (
                                <div key={idx} className={`flex items-center gap-2 group w-full ${m.senderRole === "user" && m.senderId === session.id ? "justify-end" : "justify-start"}`}>
                                  {m.senderRole === "user" && m.senderId === session.id && (
                                    <Button
                                      icon={<DeleteOutlined className="text-red-500" />}
                                      onClick={() => handleDeleteMessage(m._id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity !bg-transparent !border-none !text-gray-500 hover:!text-red-500"
                                      size="small"
                                    />
                                  )}
                                  <div
                                    className={`flex flex-col max-w-[70%] p-4 rounded-2xl ${
                                      m.senderRole === "user" && m.senderId === session.id
                                        ? "bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.15)]"
                                        : "bg-gray-950 border border-gray-900"
                                    }`}
                                  >
                                    <span className={`text-[8px] font-black uppercase tracking-wider mb-1 ${
                                      m.senderRole === "mentor" ? "text-[var(--primary)]" : "text-amber-500"
                                    }`}>
                                      {m.senderRole === "mentor" ? "Global Mentor Broadcast" : (m.senderRole === "user" && m.senderId === session.id) ? "You" : "Peer"}
                                    </span>

                                    {/* Text content */}
                                    {parsed.text && <p className="text-xs leading-relaxed text-gray-200">{parsed.text}</p>}

                                    {/* Media content */}
                                    {parsed.media && (
                                      <div className="mt-3 p-3 bg-black/80 border border-gray-900 rounded-xl flex flex-col gap-2 max-w-sm">
                                        {parsed.media.type.startsWith("image/") ? (
                                          <img
                                            src={parsed.media.dataUrl}
                                            alt={parsed.media.name}
                                            className="rounded-lg max-h-40 object-cover border border-gray-900"
                                          />
                                        ) : (
                                          <div className="flex items-center gap-2 text-amber-400">
                                            <FileTextOutlined className="text-xl" />
                                            <span className="text-[10px] font-bold truncate max-w-[180px]">{parsed.media.name}</span>
                                          </div>
                                        )}
                                        <a
                                          href={parsed.media.dataUrl}
                                          download={parsed.media.name}
                                          className="text-[8px] font-black uppercase tracking-widest text-[var(--primary)] hover:text-amber-400 self-end flex items-center gap-1 mt-1"
                                        >
                                          <LinkOutlined /> Download File
                                        </a>
                                      </div>
                                    )}

                                    <span className="text-[8px] text-gray-600 mt-1 self-end">{new Date(m.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  {!(m.senderRole === "user" && m.senderId === session.id) && (
                                    <Button
                                      icon={<DeleteOutlined className="text-red-500" />}
                                      onClick={() => handleDeleteMessage(m._id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity !bg-transparent !border-none !text-gray-500 hover:!text-red-500"
                                      size="small"
                                    />
                                  )}
                                </div>
                              );
                            })
                          )}
                          <div ref={groupChatBottomRef} />
                        </div>

                        {/* Selected Group File Preview */}
                        {selectedGroupFile && (
                          <div className="p-3 bg-gray-950 border border-gray-900 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {selectedGroupFile.type.startsWith("image/") ? (
                                <img src={selectedGroupFile.dataUrl} className="w-8 h-8 rounded object-cover border border-gray-800" />
                              ) : (
                                <FileTextOutlined className="text-xl text-amber-500" />
                              )}
                              <div>
                                <span className="text-[10px] text-white font-bold block">{selectedGroupFile.name}</span>
                                <span className="text-[8px] text-gray-500 uppercase block">{selectedGroupFile.type || "unknown type"}</span>
                              </div>
                            </div>
                            <Button
                              icon={<CloseOutlined />}
                              size="small"
                              onClick={() => setSelectedGroupFile(null)}
                              className="!bg-transparent !border-none !text-gray-500 hover:!text-red-500"
                            />
                          </div>
                        )}

                        {/* Group Chat Input bar */}
                        {userMentorship?.status === "active" ? (
                          <div className="flex items-center gap-2 bg-[#050508] border border-gray-950 p-2.5 rounded-2xl">
                            <input
                              type="file"
                              ref={groupFileInputRef}
                              className="hidden"
                              onChange={(e) => handleFileChange(e, true)}
                            />

                            <button
                              onClick={() => groupFileInputRef.current?.click()}
                              className="h-10 w-10 rounded-xl border border-gray-900 bg-black hover:border-[var(--primary)] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                            >
                              <PaperClipOutlined className="text-sm" />
                            </button>

                            <Popover
                              open={showGroupEmojiPicker}
                              onOpenChange={setShowGroupEmojiPicker}
                              trigger="click"
                              placement="top"
                              content={
                                <div className="grid grid-cols-6 gap-2 p-2 bg-black border border-gray-900 rounded-xl max-w-[220px]">
                                  {TECH_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        setNewGroupText((prev) => prev + emoji);
                                        setShowGroupEmojiPicker(false);
                                      }}
                                      className="text-base p-1.5 hover:bg-gray-900 rounded-lg transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              }
                            >
                              <button className="h-10 w-10 rounded-xl border border-gray-900 bg-black hover:border-[var(--primary)] text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                                <SmileOutlined className="text-sm" />
                              </button>
                            </Popover>

                            <Input
                              value={newGroupText}
                              onChange={(e) => setNewGroupText(e.target.value)}
                              onPressEnter={handleSendGroupMessage}
                              placeholder="Type global group broadcast message..."
                              className="!bg-black !text-white !border-none focus:!border-none !shadow-none font-mono text-xs h-10 flex-1"
                            />
                            <button
                              onClick={handleSendGroupMessage}
                              className="h-10 px-6 bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <SendOutlined /> Broadcast
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-950 border border-gray-900 text-gray-500 text-xs font-bold uppercase rounded-xl">
                            Features Locked: Mentorship Subscription Expired
                          </div>
                        )}
                      </div>
                    ),
                  }
                ]}
              />
            </div>
          )}

          {/* 1-on-1 Sessions Workspace */}
          {activeWorkspace === "sessions" && (
            <div className="font-mono bg-black text-gray-200 p-4">
              <div className="border-b border-gray-900 pb-3 mb-4 flex items-center gap-2">
                <CalendarOutlined className="text-[var(--primary)]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">1-on-1 Call Scheduler</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Form */}
                <div className="p-4 bg-[#07070a] border border-gray-950 rounded-2xl flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">◈ Book a new slot</h4>
                  
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-1.5 block">Select Session Date</label>
                    <input
                      type="date"
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                      className="w-full bg-black border border-gray-900 focus:border-[var(--primary)] rounded-xl p-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-1.5 block">Select Session Time</label>
                    <input
                      type="time"
                      value={newSessionTime}
                      onChange={(e) => setNewSessionTime(e.target.value)}
                      className="w-full bg-black border border-gray-900 focus:border-[var(--primary)] rounded-xl p-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-1.5 block">Session Agenda / Topic</label>
                    <Input
                      value={newSessionTopic}
                      onChange={(e) => setNewSessionTopic(e.target.value)}
                      placeholder="e.g. Resume analysis, mock practice..."
                      className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl !shadow-none font-mono text-xs"
                    />
                  </div>

                  <button
                    onClick={handleScheduleSession}
                    className="mt-2 py-3 bg-[var(--primary)] text-black font-black uppercase tracking-wider text-[10px] rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>

                {/* Right Lists */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">◈ Booked calls</h4>
                  
                  <div className="flex-1 overflow-y-auto max-h-72 flex flex-col gap-3 pr-2">
                    {sessions.length === 0 ? (
                      <div className="text-center italic text-gray-600 text-[10px] font-bold uppercase tracking-wider my-auto">No upcoming calls booked yet.</div>
                    ) : (
                      sessions.map((s, idx) => (
                        <div key={idx} className="p-4 bg-gray-950 border border-gray-900 rounded-xl flex items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-black text-white uppercase">{s.topic}</div>
                            <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-500 font-bold uppercase">
                              <CalendarOutlined /> {new Date(s.date).toLocaleDateString()}
                              <ClockCircleOutlined className="ml-2" /> {s.time}
                            </div>
                          </div>
                          
                          <a
                            href={s.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-black border border-gray-900 hover:border-[var(--primary)] text-[9px] text-[var(--primary)] font-black uppercase tracking-widest rounded-lg transition-colors text-center"
                          >
                            Launch Meet
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Reviews / Resume Optimization Workspace */}
          {(activeWorkspace === "projects" || activeWorkspace === "resumes") && (
            <div className="font-mono bg-black text-gray-200 p-4">
              <div className="border-b border-gray-900 pb-3 mb-4 flex items-center gap-2">
                <RocketOutlined className="text-[var(--primary)]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  {activeWorkspace === "projects" ? "Project Review Terminal" : "Resume Optimization Terminal"}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Form */}
                <div className="p-4 bg-[#07070a] border border-gray-950 rounded-2xl flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">◈ Submit a new review</h4>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-1.5 block">Title</label>
                    <Input
                      value={newSubTitle}
                      onChange={(e) => setNewSubTitle(e.target.value)}
                      placeholder={activeWorkspace === "projects" ? "e.g. My Portfolio React App" : "e.g. My SDE resume v2"}
                      className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl !shadow-none font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-1.5 block">Link (GitHub / Drive / Dropbox)</label>
                    <Input
                      value={newSubLink}
                      onChange={(e) => setNewSubLink(e.target.value)}
                      placeholder="e.g. https://github.com/my-profile/repo"
                      className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl !shadow-none font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-1.5 block">Additional Notes / Tech Stack</label>
                    <TextArea
                      value={newSubNotes}
                      onChange={(e) => setNewSubNotes(e.target.value)}
                      placeholder="Specify tech stack or targeted job descriptions..."
                      rows={3}
                      className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl !shadow-none font-mono text-xs"
                    />
                  </div>

                  <button
                    onClick={() => handleSubmitReview(activeWorkspace === "projects" ? "project" : "resume")}
                    className="mt-2 py-3 bg-[var(--primary)] text-black font-black uppercase tracking-wider text-[10px] rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    Confirm Submission
                  </button>
                </div>

                {/* Submissions List */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">◈ Review History</h4>

                  <div className="flex-1 overflow-y-auto max-h-80 flex flex-col gap-3 pr-2">
                    {submissions.filter(sub => sub.type === (activeWorkspace === "projects" ? "project" : "resume")).length === 0 ? (
                      <div className="text-center italic text-gray-600 text-[10px] font-bold uppercase tracking-wider my-auto">No prior submissions made.</div>
                    ) : (
                      submissions.filter(sub => sub.type === (activeWorkspace === "projects" ? "project" : "resume")).map((s, idx) => (
                        <div key={idx} className="p-4 bg-gray-950 border border-gray-900 rounded-xl">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-black text-white uppercase">{s.title}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              s.status === "reviewed" ? "bg-green-950 text-green-400 border border-green-900/30" : "bg-black text-[var(--primary)] border border-gray-800"
                            }`}>
                              {s.status}
                            </span>
                          </div>

                          <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 flex items-center gap-1">
                            <LinkOutlined /> <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">{s.link}</a>
                          </div>

                          {s.notes && <p className="text-[10px] text-gray-400 mt-2 italic bg-[#0c0c10] p-2 rounded-lg border border-gray-950">Notes: {s.notes}</p>}
                          {s.feedback && <p className="text-[10px] text-green-400/90 mt-2 bg-green-950/10 p-2 rounded-lg border border-green-900/20">Feedback: {s.feedback}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mock Interviews Workspace */}
          {activeWorkspace === "mocks" && (
            <div className="font-mono bg-black text-gray-200 p-4">
              <div className="border-b border-gray-900 pb-3 mb-4 flex items-center gap-2">
                <TrophyOutlined className="text-[var(--primary)]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">Mock Interview Simulator</span>
              </div>

              {!mockRunning && !mockResult && (
                <div className="text-center py-10">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Simulate real technical practice interview</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
                    Our simulator will test you on typical senior-level coding, architectural, and systemic engineering challenges designed specifically for your experience.
                  </p>
                  <button
                    onClick={handleStartMock}
                    className="px-8 py-3 bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    Start Simulated Practice
                  </button>
                </div>
              )}

              {mockRunning && (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <Spin size="large" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] animate-pulse">Running diagnostic technical simulation algorithms...</div>
                </div>
              )}

              {mockResult && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-950 border border-gray-900 rounded-xl">
                      <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Performance score</div>
                      <div className="text-2xl font-black text-white">{mockResult.score}</div>
                    </div>
                    <div className="p-4 bg-gray-950 border border-gray-900 rounded-xl">
                      <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Verdict</div>
                      <div className="text-2xl font-black text-green-400">{mockResult.verdict}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-950 border border-gray-900 rounded-xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Direct feedback details</div>
                    <p className="text-xs leading-relaxed text-gray-300">{mockResult.feedback}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sample solved diagnostics</div>
                    {mockResult.qa.map((qa, idx) => (
                      <div key={idx} className="p-3 bg-black border border-gray-900 rounded-xl">
                        <div className="text-xs font-black text-white uppercase">Q: {qa.q}</div>
                        <div className="text-xs text-gray-400 mt-1">A: {qa.a}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleStartMock}
                    className="py-3 bg-black border border-gray-900 hover:border-[var(--primary)] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white rounded-xl transition-colors"
                  >
                    Run another practice simulation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Learning Resources Workspace */}
          {activeWorkspace === "resources" && (
            <div className="font-mono bg-black text-gray-200 p-4">
              <div className="border-b border-gray-900 pb-3 mb-4 flex items-center gap-2">
                <FileTextOutlined className="text-[var(--primary)]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">Learning Resources Curation</span>
              </div>

              <div className="grid gap-4">
                {resources.length === 0 ? (
                  <div className="text-center italic text-gray-600 text-[10px] font-bold uppercase tracking-wider my-auto py-10">No learning resources curated by mentor yet.</div>
                ) : (
                  resources.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-950 border border-gray-900 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-black text-white uppercase">{item.title}</span>
                        {item.notes && <p className="text-[10px] text-gray-500 mt-1 italic">{item.notes}</p>}
                      </div>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black border border-gray-900 hover:border-[var(--primary)] text-[9px] text-[var(--primary)] font-black uppercase tracking-widest rounded-lg transition-colors flex-shrink-0 text-center">
                        <LinkOutlined className="mr-1" /> Access
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* ================= PREMIUM LOCK CTA ================= */}
        {!hasAccess && (
          <div className="mt-16 relative overflow-hidden rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-10 text-center shadow-[0_0_50px_rgba(250,204,21,0.03)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.03),_transparent_60%)] pointer-events-none" />

            <div className="relative">
              <h3 className="text-2xl font-black text-white uppercase tracking-wide">
                Unlock Your Full Mentorship Potential
              </h3>
              <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
                Upgrade your subscription package to access direct Slack/messaging chat channels, mock reviews, code architecture support, and verified referrals.
              </p>
              <button
                className="mt-8 btn-yellow py-3 px-12 text-xs font-bold uppercase tracking-widest"
                onClick={() => navigate(`/mentor/${mentorId}`)}
              >
                View Upgrade Options
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------- STAT CARD -------------------- */
const StatCard = ({ label, value, icon }) => {
  return (
    <div className="relative overflow-hidden bg-[#07070a]/90 border border-[rgba(250,204,21,0.08)] rounded-2xl p-6 shadow-md hover:border-[rgba(250,204,21,0.2)] transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.01),_transparent_60%)] pointer-events-none" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            {label}
          </p>
          <h4 className="text-lg md:text-xl font-black mt-2 text-white">{value}</h4>
        </div>
        <div className="w-10 h-10 rounded-xl border border-gray-800 bg-black flex items-center justify-center text-[var(--primary)]">
          {icon}
        </div>
      </div>
    </div>
  );
};

/* -------------------- FEATURE PANEL -------------------- */
const FeaturePanel = ({ title, items, type }) => {
  return (
    <div className="bg-[#07070a]/90 border border-[rgba(250,204,21,0.08)] rounded-2xl p-7 shadow-sm">
      <h4 className="font-black uppercase tracking-wider text-xs text-white mb-6 border-b border-gray-900 pb-3">{title}</h4>
      <ul className="space-y-4 text-xs font-semibold">
        {items
          ?.flatMap((x) => x.split(","))
          .map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              {type === "allowed" ? (
                <CheckCircleOutlined className="text-green-400 mt-[2px] text-sm" />
              ) : (
                <LockOutlined className="text-gray-600 mt-[2px] text-sm" />
              )}
              <span
                className={
                  type === "allowed" ? "text-gray-200" : "text-gray-600"
                }
              >
                {item.trim()}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};

/* -------------------- WORKSPACE CARD -------------------- */
const WorkspaceCard = ({
  title,
  description,
  icon,
  enabled,
  cta,
  premium,
  onClick,
}) => {
  return (
    <div
      onClick={enabled ? onClick : undefined}
      className={`group relative overflow-hidden rounded-2xl border bg-[#07070a]/95 p-7 transition-all duration-500 ${
        enabled
          ? "border-[rgba(250,204,21,0.12)] hover:border-[var(--primary)] hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(250,204,21,0.08)] cursor-pointer"
          : "border-gray-950 opacity-40"
      }`}
    >
      {/* Tech Bracket Corners */}
      {enabled && (
        <>
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
        </>
      )}

      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.03),_transparent_60%)] pointer-events-none" />

      {/* Premium badge */}
      {premium && (
        <div className="absolute top-4 right-4 text-[9px] px-2 py-0.5 rounded bg-[var(--primary)] text-black font-black tracking-widest uppercase">
          PRO
        </div>
      )}

      {/* Lock overlay */}
      {!enabled && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10 transition-all duration-300">
          <Tooltip title="Upgrade plan to unlock">
            <div className="w-10 h-10 rounded-full bg-black border border-gray-800 flex items-center justify-center shadow-lg">
              <LockOutlined className="text-sm text-gray-500" />
            </div>
          </Tooltip>
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl border border-gray-800 bg-black flex items-center justify-center text-[var(--primary)]">
          {icon}
        </div>
        {enabled && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-green-400 bg-green-950/20 border border-green-900/30 px-2 py-0.5 rounded">
            Enabled
          </span>
        )}
      </div>

      <h4 className="relative font-bold text-white uppercase tracking-wider mt-5 text-sm">
        {title}
      </h4>
      <p className="relative text-gray-400 text-xs mt-2.5 leading-relaxed min-h-[48px]">
        {description}
      </p>

      <button
        disabled={!enabled}
        className={`relative mt-6 w-full py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors duration-300 ${
          enabled
            ? "bg-[var(--primary)] text-black hover:bg-amber-400 cursor-pointer"
            : "bg-gray-900/40 border border-gray-800 text-gray-600 cursor-not-allowed"
        }`}
      >
        {cta}
      </button>
    </div>
  );
};

export default MentorshipDetails;
