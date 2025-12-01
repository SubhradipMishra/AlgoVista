import React, { useState } from "react";
import axios from "axios";
import { Button, Card, Upload, Table, Input, Switch, Tooltip } from "antd";
import {
  UploadOutlined,
  RightOutlined,
  HomeOutlined,
  UploadOutlined as UpIcon,
  DatabaseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddProblems() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchText, setSearchText] = useState("");

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
      render: (text) => (
        <span className={darkMode ? "text-gray-100" : "text-gray-700"}>{text}</span>
      ),
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
      render: (text) => (
        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{text}</span>
      ),
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      sorter: (a, b) => a.topic.localeCompare(b.topic),
      render: (text) => (
        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>{text}</span>
      ),
    },
  ];

  const handlePasteJSON = () => {
    const jsonText = prompt("Paste full problem JSON:");
    if (!jsonText) return;

    try {
      const parsed = JSON.parse(jsonText);

      axios
        .post("http://localhost:4000/problem", parsed)
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
          .post("http://localhost:4000/problem", parsed)
          .then(() => toast.success("✅ Problem uploaded successfully!"))
          .catch(() => toast.error("❌ Upload failed!"));
      } catch {
        toast.error("❌ Invalid JSON file!");
      }
    };

    reader.readAsText(file);
    return false;
  };

  return (
    <div
      className={`flex min-h-screen font-mono ${
        darkMode ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* SIDEBAR */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } transition-all duration-300 bg-[#0b0b0b] border-r border-gray-800 p-6`}
      >
        <div className="flex justify-between items-center !mb-10">
          {!collapsed && (
            <h1 className="text-2xl font-bold text-gray-100 tracking-wide">
              AlgoVista
            </h1>
          )}

          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            className="text-gray-300"
          />
        </div>

        <nav className="flex flex-col gap-4">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-900 transition">
            <HomeOutlined className="text-gray-300" />
            {!collapsed && <span className="text-gray-300">Dashboard</span>}
          </button>

          <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700">
            <UpIcon className="text-gray-200" />
            {!collapsed && (
              <span className="text-gray-200 font-bold">Add Problems</span>
            )}
          </button>

          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-900 transition">
            <DatabaseOutlined className="text-gray-300" />
            {!collapsed && <span className="text-gray-300">All Problems</span>}
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
        {/* TOP NAVBAR */}
        <div className="w-full flex justify-between items-center !mb-10">
          <h1 className="text-3xl font-bold tracking-wide">
            Problem Management
          </h1>

          <div className="flex items-center gap-4">
            {/* Search bar */}
            <Input
              placeholder="Search problems..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              className="!w-64 !rounded-xl bg-[#111] border border-gray-700 text-white placeholder-gray-500"
            />

            {/* Theme toggle */}
            <Tooltip title="Toggle Theme">
              <Switch
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </Tooltip>
          </div>
        </div>

        {/* CARDS */}
        <div className="flex flex-col items-center">

          {/* Upload Card */}
          <Card
            className="max-w-2xl w-full rounded-3xl shadow-2xl !mb-10"
            style={{
              background: darkMode ? "#0c0c0c" : "#fff",
              border: "1px solid #333",
            }}
          >
            <h1 className="text-4xl font-bold text-center tracking-wide !mb-8">
              Upload Problem JSON
            </h1>

            <div className="flex flex-col gap-5">
              <Button
                onClick={handlePasteJSON}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                border border-gray-700 bg-black text-gray-200 hover:bg-gray-900 
                transition-all duration-200 shadow-md"
              >
                Paste JSON <RightOutlined />
              </Button>

              <Upload accept=".json" beforeUpload={handleJSONUpload} showUploadList={false}>
                <Button
                  icon={<UploadOutlined />}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                  border border-gray-700 bg-black text-gray-200 hover:bg-gray-900 
                  transition-all duration-200 shadow-md"
                >
                  Upload JSON File
                </Button>
              </Upload>

              <p className="text-gray-400 text-sm text-center">
                Supported: .json
              </p>
            </div>
          </Card>

          {/* Table */}
          <Card
            className="max-w-3xl w-full rounded-3xl shadow-xl"
            style={{
              background: darkMode ? "#0a0a0a" : "#fff",
              border: "1px solid #333",
            }}
          >
            <h2 className="text-2xl font-bold !mb-5 text-center">
              Demo Problem List
            </h2>

            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={{ pageSize: 5 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: darkMode ? "#111" : "#fafafa",
              }}
            />
          </Card>

          <ToastContainer theme="dark" />
        </div>
      </div>
    </div>
  );
}
