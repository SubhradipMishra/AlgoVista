"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  ArrowLeftOutlined,
  MessageOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SendOutlined,
  CrownOutlined,
  PlusOutlined,
  LinkOutlined,
  InboxOutlined,
  PaperClipOutlined,
  SmileOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  PictureOutlined,
  CloseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Skeleton,
  message,
  Avatar,
  Tag,
  Button,
  Input,
  Tabs,
  Modal,
  Popover,
  Upload,
} from "antd";
import { motion } from "framer-motion";
import Context from "../../util/context";
import AdminSidebar from "./AdminSidebar";

const API = `${import.meta.env.VITE_API_URL}`;
const GROUP_ROOM_ID = "696e640ad1839372fa975000"; // Dynamic group room ObjectId

const TECH_EMOJIS = ["💻", "🚀", "💡", "🔥", "✅", "❌", "👏", "💯", "👍", "🙌", "🎯", "📝", "📊", "🧠", "✨", "🎉", "👨‍💻", "👑"];

const AdminMentorshipDetails = () => {
  const { mentorshipId } = useParams();
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);
  const [open, setOpen] = useState(false);

  // States
  const [loading, setLoading] = useState(true);
  const [mentorship, setMentorship] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");

  // Chat States
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Group Chat States
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupText, setNewGroupText] = useState("");
  const [showGroupEmojiPicker, setShowGroupEmojiPicker] = useState(false);
  const [selectedGroupFile, setSelectedGroupFile] = useState(null);
  const groupFileInputRef = useRef(null);
  const groupChatBottomRef = useRef(null);

  // Sessions States
  const [sessions, setSessions] = useState([]);
  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionTime, setNewSessionTime] = useState("");
  const [newSessionTopic, setNewSessionTopic] = useState("");

  // Submissions States
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("reviewed");
  const [reviewFeedback, setReviewFeedback] = useState("");

  // Resources Mock/Local state
  const [resources, setResources] = useState([
    { title: "Singly Linked List Template in C++", link: "https://github.com", notes: "Use this to optimize edge-cases." },
    { title: "Platform Architecture Reference Document", link: "https://drive.google.com", notes: "Read modules 3 and 4 before call." },
  ]);
  const [newResTitle, setNewResTitle] = useState("");
  const [newResLink, setNewResLink] = useState("");
  const [newResNotes, setNewResNotes] = useState("");

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

  /* -------------------- Fetch Core Data -------------------- */
  useEffect(() => {
    if (session && mentorshipId) {
      fetchMentorshipDetails();
    }
  }, [session, mentorshipId]);

  const fetchMentorshipDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/mentorship`, {
        withCredentials: true,
      });
      const current = data.find((m) => m._id === mentorshipId);
      if (!current) {
        message.error("Mentorship contract not found");
        navigate("/admin/dashboard");
        return;
      }
      setMentorship(current);
    } catch (err) {
      console.error(err);
      message.error("Failed to load mentorship details");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Fetch Sub-Features Data -------------------- */
  useEffect(() => {
    if (mentorship?._id) {
      fetchMessages();
      fetchGroupMessages();
      fetchSessions();
      fetchSubmissions();
      fetchResources();

      // Sockets Integration
      socketRef.current = io(API);
      
      // Join both private & group rooms
      socketRef.current.emit("join_room", mentorship._id);
      socketRef.current.emit("join_room", GROUP_ROOM_ID);

      socketRef.current.on("receive_message", (msg) => {
        if (msg.mentorshipId === GROUP_ROOM_ID) {
          setGroupMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        } else if (msg.mentorshipId === mentorship._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [mentorship]);

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

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API}/mentorship/${mentorshipId}/messages`, {
        withCredentials: true,
      });
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroupMessages = async () => {
    try {
      const { data } = await axios.get(`${API}/mentorship/${GROUP_ROOM_ID}/messages`, {
        withCredentials: true,
      });
      setGroupMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      if (mentorship?.planSnapshot?.title?.toUpperCase() === "BASIC") return;
      const { data } = await axios.get(`${API}/mentorship/${mentorshipId}/sessions`, {
        withCredentials: true,
      });
      setSessions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      if (mentorship?.planSnapshot?.title?.toUpperCase() === "BASIC") return;
      const { data } = await axios.get(`${API}/mentorship/${mentorshipId}/submissions`, {
        withCredentials: true,
      });
      setSubmissions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    try {
      const { data } = await axios.get(`${API}/mentorship/${mentorshipId}/resources`, {
        withCredentials: true,
      });
      setResources(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------- Helper parser -------------------- */
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

  /* -------------------- Actions -------------------- */
  const handleSendMessage = () => {
    if (!newMessageText.trim() && !selectedFile) return;
    if (!socketRef.current || !mentorship) return;

    try {
      // Serialize rich media payload inside text field to guarantee compatibility
      const messagePayload = {
        text: newMessageText,
        media: selectedFile ? {
          name: selectedFile.name,
          type: selectedFile.type,
          dataUrl: selectedFile.dataUrl,
        } : null
      };

      socketRef.current.emit("send_message", {
        mentorshipId: mentorship._id,
        senderId: session.id,
        senderRole: "mentor",
        text: JSON.stringify(messagePayload),
      });

      setNewMessageText("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Send message error:", err);
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
        senderRole: "mentor",
        text: JSON.stringify(messagePayload),
      });

      setNewGroupText("");
      setSelectedGroupFile(null);
      setShowGroupEmojiPicker(false);
    } catch (err) {
      console.error("Send group message error:", err);
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
          room: mentorship?._id,
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
      message.success("Message deleted successfully");
    } catch (err) {
      console.error("Delete message failed:", err);
      message.error("Failed to delete message");
    }
  };

  const handleFileChange = (e, isGroup = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      message.error("File is too large! Maximum allowed size is 5MB.");
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
      message.success(`Attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleScheduleCall = async () => {
    if (!newSessionDate || !newSessionTime || !newSessionTopic.trim()) {
      message.warning("Please complete all call schedule parameters");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API}/mentorship/${mentorshipId}/sessions`,
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
      message.success("1-on-1 session successfully scheduled!");
    } catch (err) {
      message.error("Failed to book session");
    }
  };

  const handleReviewSubmission = async () => {
    if (!reviewFeedback.trim()) {
      message.warning("Please complete feedback comments");
      return;
    }
    try {
      const { data } = await axios.put(
        `${API}/mentorship/submissions/${activeSubmission._id}`,
        {
          status: reviewStatus,
          feedback: reviewFeedback,
        },
        { withCredentials: true }
      );
      setSubmissions((prev) =>
        prev.map((sub) => (sub._id === data._id ? data : sub))
      );
      setActiveSubmission(null);
      setReviewFeedback("");
      message.success("Submission successfully reviewed!");
    } catch (err) {
      message.error("Failed to submit feedback");
    }
  };

  const handleAddResource = async () => {
    if (!newResTitle.trim() || !newResLink.trim()) {
      message.warning("Resource Title and URL are required");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API}/mentorship/${mentorshipId}/resources`,
        {
          title: newResTitle,
          link: newResLink,
          notes: newResNotes,
        },
        { withCredentials: true }
      );
      setResources((prev) => [data, ...prev]);
      setNewResTitle("");
      setNewResLink("");
      setNewResNotes("");
      message.success("Resource shared with student!");
    } catch (err) {
      message.error("Failed to share resource");
    }
  };

  // Extract shared media files from chat history to manage them
  const extractMediaFiles = (msgsList) => {
    const list = [];
    msgsList.forEach((m) => {
      const parsed = parseMessageText(m.text);
      if (parsed.media) {
        list.push({
          messageId: m._id,
          senderRole: m.senderRole,
          createdAt: m.createdAt,
          ...parsed.media,
        });
      }
    });
    return list;
  };

  const activeMediaList = extractMediaFiles([...messages, ...groupMessages]);

  if (sessionLoading || loading || !mentorship) {
    return (
      <div className="flex min-h-screen bg-black text-white font-mono overflow-hidden">
        <aside className="w-64 bg-gray-900 border-r border-gray-700 p-6 flex flex-col gap-6">
          <Skeleton.Avatar active size={64} shape="circle" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </aside>
        <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
          <Skeleton.Input active size="large" style={{ width: "40%", marginBottom: "1.5rem" }} />
          <Skeleton active paragraph={{ rows: 10 }} />
        </main>
      </div>
    );
  }

  const isBasic = mentorship.planSnapshot?.title?.toUpperCase() === "BASIC";

  return (
    <div className="min-h-screen flex bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Sidebar */}
      <AdminSidebar session={session} open={open} setOpen={setOpen} />

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 relative z-10 font-mono overflow-y-auto max-h-screen">
        
        {/* Header command strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 border-b border-gray-900 pb-5">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/dashboard")}
              className="!bg-black/60 !border-[rgba(250,204,21,0.25)] !text-gray-300 hover:!text-[var(--primary)] hover:!border-[var(--primary)] h-10 w-10 rounded-xl flex items-center justify-center"
            />
            <div>
              <h1 className="text-xl font-black text-white tracking-wide leading-none uppercase">
                Mentee workspace details
              </h1>
              <p className="text-xs text-[var(--primary)] mt-1">
                Student Profile: {mentorship.user?.fullname}
              </p>
            </div>
          </div>
          
          <Tag color={mentorship.status === "active" ? "green" : "red"} className="font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-md">
            {mentorship.status} contract
          </Tag>
        </div>

        {/* MENTEE DETAILS PROFILE SUMMARY CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(250,204,21,0.1)] bg-[#07070a] p-6 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <Avatar src={mentorship.user?.profileImage} size={80} className="border border-[rgba(250,204,21,0.2)] bg-black" />
            <div>
              <h3 className="text-lg font-black text-white uppercase">{mentorship.user?.fullname}</h3>
              <p className="text-xs text-gray-500 lowercase mt-0.5">{mentorship.user?.email}</p>
              
              <div className="flex flex-wrap gap-2 mt-4 text-[10px] uppercase tracking-widest font-black">
                <span className="bg-black border border-gray-900 text-amber-400 px-3 py-1 rounded-md">
                  <CrownOutlined /> {mentorship.planSnapshot?.title} plan
                </span>
                <span className="bg-black border border-gray-900 text-gray-400 px-3 py-1 rounded-md">
                  Expires: {new Date(mentorship.endingDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-900 pt-6 md:pt-0 md:pl-6 text-[10px] font-bold uppercase tracking-wider space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Contract Starting</span>
              <span className="text-gray-300">{new Date(mentorship.startingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Active status</span>
              <span className={mentorship.status === "active" ? "text-green-400" : "text-red-500"}>{mentorship.status}</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE SECTIONS TABS */}
        <div className="bg-[#07070a]/95 border border-[rgba(250,204,21,0.08)] rounded-2xl p-6 shadow-2xl">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="futuristic-tabs"
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
                          No active messages recorded in this secure channel. Send a welcome message!
                        </div>
                      ) : (
                        messages.map((m, idx) => {
                          const parsed = parseMessageText(m.text);
                          return (
                            <div key={idx} className={`flex items-center gap-2 group w-full ${m.senderRole === "mentor" ? "justify-end" : "justify-start"}`}>
                              {m.senderRole === "mentor" && (
                                <Button
                                  icon={<DeleteOutlined className="text-red-500" />}
                                  onClick={() => handleDeleteMessage(m._id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity !bg-transparent !border-none !text-gray-500 hover:!text-red-500"
                                  size="small"
                                />
                              )}
                              <div
                                className={`flex flex-col max-w-[70%] p-4 rounded-2xl ${
                                  m.senderRole === "mentor"
                                    ? "bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.15)]"
                                    : "bg-gray-950 border border-gray-900"
                                }`}
                              >
                                <span className={`text-[8px] font-black uppercase tracking-wider mb-1 ${
                                  m.senderRole === "mentor" ? "text-[var(--primary)]" : "text-amber-500"
                                }`}>
                                  {m.senderRole === "mentor" ? "You (Mentor)" : mentorship.user?.fullname}
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
                              {m.senderRole !== "mentor" && (
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
                    {mentorship.status === "active" ? (
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
                          placeholder="Type real-time secure reply message..."
                          className="!bg-black !text-white !border-none focus:!border-none !shadow-none font-mono text-xs h-10 flex-1"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="h-10 px-6 bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <SendOutlined /> Send message
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
                          Welcome to the Global Mentorship Lounge! Drop a broadcast message to all active basic plan students.
                        </div>
                      ) : (
                        groupMessages.map((m, idx) => {
                          const parsed = parseMessageText(m.text);
                          return (
                            <div
                              key={idx}
                              className={`flex flex-col max-w-[70%] p-4 rounded-2xl ${
                                m.senderRole === "mentor"
                                  ? "bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.15)] self-end"
                                  : "bg-gray-950 border border-gray-900 self-start"
                              }`}
                            >
                              <span className={`text-[8px] font-black uppercase tracking-wider mb-1 ${
                                m.senderRole === "mentor" ? "text-[var(--primary)]" : "text-amber-500"
                              }`}>
                                {m.senderRole === "mentor" ? "Global Mentor Broadcast" : "Mentee Room"}
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
                    {mentorship.status === "active" ? (
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
                          <SendOutlined /> Broadcast message
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
                        <UserOutlined /> Personal Chat Attachments ({extractMediaFiles(messages).length})
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
              ...(!isBasic ? [
                {
                  key: "sessions",
                  label: (
                    <span className="text-xs uppercase font-black tracking-wider px-2">
                      <CalendarOutlined /> 1-on-1 Sessions
                    </span>
                  ),
                  children: (
                    <div className="space-y-6 pt-4">
                      {/* Session Scheduler */}
                      {mentorship.status === "active" ? (
                        <div className="p-6 bg-black border border-gray-950 rounded-2xl">
                          <h4 className="text-xs font-black uppercase text-white mb-4 tracking-wider">Schedule a New Call</h4>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <Input
                              type="date"
                              value={newSessionDate}
                              onChange={(e) => setNewSessionDate(e.target.value)}
                              className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono text-xs"
                            />
                            <Input
                              type="time"
                              value={newSessionTime}
                              onChange={(e) => setNewSessionTime(e.target.value)}
                              className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono text-xs"
                            />
                            <Input
                              value={newSessionTopic}
                              onChange={(e) => setNewSessionTopic(e.target.value)}
                              placeholder="Call Topic (e.g. Resume Sync)"
                              className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono text-xs"
                            />
                          </div>
                          <button
                            onClick={handleScheduleCall}
                            className="mt-4 px-6 py-2.5 bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                          >
                            <PlusOutlined /> Schedule 1-on-1 Session
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-gray-950 border border-gray-900 text-gray-500 text-xs font-bold uppercase rounded-xl">
                          Features Locked: Mentorship Subscription Expired
                        </div>
                      )}

                      {/* Sessions List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-white tracking-wider border-b border-gray-900 pb-2">Upcoming Calls</h4>
                        {sessions.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-gray-950 text-xs text-gray-500 font-bold uppercase">No calls currently scheduled.</div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {sessions.map((item, idx) => (
                              <div key={idx} className="p-5 bg-black border border-gray-950 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--primary)] opacity-40"></div>
                                <h5 className="text-xs font-black text-white uppercase">{item.topic}</h5>
                                <p className="text-[10px] text-gray-500 mt-2 font-black uppercase">
                                  <CalendarOutlined /> {new Date(item.date).toLocaleDateString()} @ {item.time}
                                </p>
                                
                                <a
                                  href={item.joinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--primary)] hover:text-amber-400 transition-colors"
                                >
                                  <LinkOutlined /> Join Google Meet
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
                  key: "submissions",
                  label: (
                    <span className="text-xs uppercase font-black tracking-wider px-2">
                      <FileTextOutlined /> Project & Resume Reviews
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 pt-4">
                      {submissions.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-gray-950 text-xs text-gray-500 font-bold uppercase rounded-2xl">
                          No submissions uploaded by the student yet.
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {submissions.map((sub, idx) => (
                            <div key={idx} className="p-6 bg-black border border-gray-950 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                    sub.type === "project" ? "text-blue-400 border-blue-950 bg-blue-950/20" : "text-amber-400 border-amber-950 bg-amber-950/20"
                                  }`}>
                                    {sub.type}
                                  </span>
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                    sub.status === "pending" ? "text-amber-500 bg-amber-950/20" : "text-green-500 bg-green-950/20"
                                  }`}>
                                    {sub.status}
                                  </span>
                                </div>

                                <h4 className="text-xs font-black text-white uppercase">{sub.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">{sub.notes || "No submission notes provided."}</p>

                                {sub.feedback && (
                                  <div className="mt-4 p-3 bg-gray-950 border border-gray-900 rounded-xl">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--primary)]">Your Expert Feedback</span>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed italic">{sub.feedback}</p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-6 pt-4 border-t border-gray-950 flex items-center gap-3">
                                <a
                                  href={sub.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-4 py-2 border border-gray-900 hover:border-[var(--primary)] text-gray-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                >
                                  <LinkOutlined /> Open Link
                                </a>
                                {sub.status === "pending" && mentorship.status === "active" && (
                                  <button
                                    onClick={() => setActiveSubmission(sub)}
                                    className="px-4 py-2 bg-[var(--primary)] text-black hover:bg-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    Submit Review
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                }
              ] : []),
              {
                key: "resources",
                label: (
                  <span className="text-xs uppercase font-black tracking-wider px-2">
                    <InboxOutlined /> Custom Resources
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-4">
                    {/* Share New Resource */}
                    {mentorship.status === "active" ? (
                      <div className="p-6 bg-black border border-gray-950 rounded-2xl">
                        <h4 className="text-xs font-black uppercase text-white mb-4 tracking-wider">Share a Custom Learning Resource</h4>
                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                          <Input
                            value={newResTitle}
                            onChange={(e) => setNewResTitle(e.target.value)}
                            placeholder="Resource Title (e.g. Master DP Checklist)"
                            className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono text-xs"
                          />
                          <Input
                            value={newResLink}
                            onChange={(e) => setNewResLink(e.target.value)}
                            placeholder="Curated Resource URL (GitHub, Drive, etc.)"
                            className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono text-xs"
                          />
                        </div>
                        <Input.TextArea
                          value={newResNotes}
                          onChange={(e) => setNewResNotes(e.target.value)}
                          placeholder="Mentor Curated Notes & Objectives..."
                          className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono text-xs mb-4"
                          rows={2}
                        />
                        <button
                          onClick={handleAddResource}
                          className="px-6 py-2.5 bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                        >
                          <PlusOutlined /> Curate & Share Resource
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-950 border border-gray-900 text-gray-500 text-xs font-bold uppercase rounded-xl">
                        Features Locked: Mentorship Subscription Expired
                      </div>
                    )}

                    {/* Resources list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider border-b border-gray-900 pb-2">Shared Repository</h4>
                      <div className="space-y-3">
                        {resources.map((item, idx) => (
                          <div key={idx} className="p-5 bg-black border border-gray-950 rounded-2xl flex items-center justify-between gap-4">
                            <div>
                              <h5 className="text-xs font-black text-white uppercase">{item.title}</h5>
                              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed italic">{item.notes}</p>
                            </div>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 border border-gray-900 hover:border-[var(--primary)] text-gray-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                              <LinkOutlined /> View Resource
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>

      {/* ================= INLINE REVIEW MODAL ================= */}
      <Modal
        open={!!activeSubmission}
        onCancel={() => setActiveSubmission(null)}
        footer={null}
        width={550}
        className="futuristic-modal"
        style={{ top: 120 }}
        destroyOnClose
      >
        {activeSubmission && (
          <div className="font-mono bg-black text-gray-200 p-4">
            <div className="border-b border-gray-900 pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Submit Expert Review
              </span>
              <p className="text-[9px] text-[var(--primary)] uppercase font-bold tracking-widest mt-0.5">
                Item: {activeSubmission.title}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Select Review Status</label>
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => setReviewStatus("reviewed")}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                      reviewStatus === "reviewed"
                        ? "bg-green-950/20 border-green-500 text-green-500"
                        : "bg-black border-gray-900 text-gray-500"
                    }`}
                  >
                    Reviewed & Approved
                  </button>
                  <button
                    onClick={() => setReviewStatus("rejected")}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                      reviewStatus === "rejected"
                        ? "bg-red-950/20 border-red-500 text-red-500"
                        : "bg-black border-gray-900 text-gray-500"
                    }`}
                  >
                    Requires Revisions
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Review Comments & Feedback</label>
                <Input.TextArea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide precise details, optimization tips, design flaws or comments..."
                  className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono text-xs mt-1.5"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setActiveSubmission(null)}
                  className="px-5 py-2.5 border border-gray-900 text-gray-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmission}
                  className="px-5 py-2.5 bg-[var(--primary)] text-black hover:bg-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  Publish Review
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMentorshipDetails;
