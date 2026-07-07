"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Upload,
  Table,
  Input,
  Switch,
  Tooltip,
  message,
} from "antd";
import {
  UploadOutlined,
  RightOutlined,
  SearchOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import { motion } from "framer-motion";      // ⭐ animations
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Context from "../../util/context";
import AdminSidebar from "./AdminSidebar";

export default function AddProblems() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [sessionLoading, setSessionLoading] = useState(true);
  const { session } = useContext(Context);
  const navigate = useNavigate();

  const demoData = [
    { key: 1, title: "Two Sum", difficulty: "Easy", topic: "Array" },
    { key: 2, title: "Binary Tree Paths", difficulty: "Medium", topic: "Tree" },
    { key: 3, title: "Dijkstra Shortest Path", difficulty: "Hard", topic: "Graph" },
  ];

  const filteredData = demoData.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Problem Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      filters: [
        { text: "Easy", value: "Easy" },
        { text: "Medium", value: "Medium" },
        { text: "Hard", value: "Hard" },
      ],
      onFilter: (value, record) => record.difficulty === value,
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      sorter: (a, b) => a.topic.localeCompare(b.topic),
    },
  ];

  // protect route
  useEffect(() => {
    if (!session) {
      setSessionLoading(false);
      navigate("/login");
    } else if (session.role !== "admin") {
      message.error("Access denied! Admins only.");
      navigate("/");
    } else {
      setSessionLoading(false);
    }
  }, [session]);

  const handlePasteJSON = () => {
    const jsonText = prompt("Paste full problem JSON:");
    if (!jsonText) return;

    try {
      const parsed = JSON.parse(jsonText);

      axios
        .post(`${import.meta.env.VITE_API_URL}/problem`, parsed, { withCredentials: true })
        .then(() => toast.success("✅ Problem uploaded successfully!"))
        .catch(() => toast.error("❌ Upload failed!"));
    } catch {
      toast.error("❌ Invalid JSON format!");
    }
  };

  const handleJSONUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        axios
          .post(`${import.meta.env.VITE_API_URL}/problem`, parsed, { withCredentials: true })
          .then(() => toast.success("✅ Problem uploaded successfully!"))
          .catch(() => toast.error("❌ Upload failed!"));
      } catch {
        toast.error("❌ Invalid JSON file!");
      }
    };

    reader.readAsText(file);
    return false;
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] animate-pulse">Initializing Problem Matrix...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-mono text-white bg-black overflow-hidden relative">
      <AdminSidebar session={session} open={collapsed} setOpen={setCollapsed} />

      {/* MAIN LAYOUT */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-10" />

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-gray-900 pb-5"
        >
          <div className="flex items-center gap-3">
            <BulbOutlined className="text-3xl text-[var(--primary)]" />
            <h1 className="text-3xl font-black uppercase tracking-wider text-white">
              Problem Management
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* SEARCH */}
            <Input
              placeholder="Search problems..."
              prefix={<SearchOutlined className="text-[var(--primary)]" />}
              onChange={(e) => setSearchText(e.target.value)}
              className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono w-full md:w-64"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* UPLOAD CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="relative overflow-hidden rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-8 shadow-[0_0_50px_rgba(250,204,21,0.03)] h-full flex flex-col justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.03),_transparent_60%)] pointer-events-none" />
              
              <h1 className="text-xs font-black text-white uppercase tracking-widest text-center mb-8 flex flex-col items-center gap-2">
                <UploadOutlined className="text-3xl text-amber-500 mb-2" />
                Inject JSON Payload
              </h1>

              <div className="flex flex-col gap-5 relative z-10">
                <button
                  onClick={handlePasteJSON}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--primary)] text-black hover:bg-amber-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-md"
                >
                  Raw JSON Paste <RightOutlined />
                </button>

                <Upload accept=".json" beforeUpload={handleJSONUpload} showUploadList={false} className="w-full">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black border border-gray-800 hover:border-[var(--primary)] text-white hover:text-[var(--primary)] font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-inner"
                  >
                    Select JSON File
                  </button>
                </Upload>

                <p className="text-[10px] font-bold text-gray-600 text-center uppercase tracking-widest mt-2 border-t border-gray-900 pt-4">Supported Format: .json</p>
              </div>
            </div>
          </motion.div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2"
          >
            <div className="relative overflow-hidden rounded-3xl border border-gray-900 bg-black p-8 shadow-md h-full">
              <h2 className="text-xs font-black uppercase tracking-widest text-white mb-6">Local Problem Archive</h2>

              <Table
                dataSource={filteredData}
                columns={columns}
                pagination={{ pageSize: 5 }}
                className="text-white"
                rowClassName={() => "hover:bg-gray-950 transition-colors bg-black"}
              />
            </div>
          </motion.div>
        </div>

        <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      </div>
    </div>
  );
}
