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
  const [darkMode, setDarkMode] = useState(true);
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
        .post("http://localhost:4000/problem", parsed, { withCredentials: true })
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
          .post("http://localhost:4000/problem", parsed, { withCredentials: true })
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
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-mono 
      ${darkMode ? "bg-[#030303] text-white" : "bg-gray-100 text-black"}`}>

      <AdminSidebar session={session} open={collapsed} setOpen={setCollapsed} />

      {/* MAIN LAYOUT */}
      <div className="flex-1 p-10 overflow-y-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r 
            from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Problem Management
          </h1>

          <div className="flex items-center gap-4">
            {/* SEARCH */}
            <Input
              placeholder="Search problems..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-64 rounded-xl px-3 py-2 shadow-lg 
                ${darkMode ? "bg-[#121212] border-gray-700 text-white" 
                           : "bg-white border-gray-300"}`}
            />

            {/* THEME TOGGLE */}
            <Tooltip title="Toggle Theme">
              <Switch
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="scale-125"
              />
            </Tooltip>
          </div>
        </motion.div>

        {/* UPLOAD CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            className="max-w-2xl w-full rounded-3xl backdrop-blur-2xl shadow-2xl border 
              border-white/10"
            style={{
              background: darkMode
                ? "rgba(20,20,20,0.6)"
                : "rgba(255,255,255,0.7)",
            }}
          >
            <h1 className="text-3xl font-bold text-center mb-6">
              Upload Problem JSON
            </h1>

            <div className="flex flex-col gap-5">
              <Button
                onClick={handlePasteJSON}
                className="flex items-center justify-center gap-2 px-4 py-3
                  rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white
                  hover:scale-105 transition-all duration-200"
              >
                Paste JSON <RightOutlined />
              </Button>

              <Upload accept=".json" beforeUpload={handleJSONUpload} showUploadList={false}>
                <Button
                  icon={<UploadOutlined />}
                  className="flex items-center justify-center gap-2 px-4 py-3
                    rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white
                    hover:scale-105 transition-all duration-200"
                >
                  Upload JSON File
                </Button>
              </Upload>

              <p className="text-gray-400 text-sm text-center">Supported: .json</p>
            </div>
          </Card>
        </motion.div>

        {/* TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-10"
        >
          <Card
            className="max-w-4xl w-full rounded-3xl shadow-xl backdrop-blur-xl border 
              border-white/10"
            style={{
              background: darkMode
                ? "rgba(15,15,15,0.6)"
                : "rgba(255,255,255,0.7)",
            }}
          >
            <h2 className="text-2xl font-bold mb-5 text-center">Demo Problem List</h2>

            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={{ pageSize: 5 }}
              className="rounded-xl"
            />
          </Card>
        </motion.div>

        <ToastContainer theme="dark" />
      </div>
    </div>
  );
}
