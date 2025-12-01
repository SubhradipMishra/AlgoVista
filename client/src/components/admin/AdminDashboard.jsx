"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  MenuOutlined,
  DashboardOutlined,
  BranchesOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Drawer, Menu, Avatar, Skeleton, message } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";
import Context from "../../util/context";

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { session, sessionLoading, setSession } = useContext(Context); // added setSession for logout
  const [stats, setStats] = useState({
    roadmaps: 14,
    questions: 92,
    learners: 540,
  });

  // 🔹 Redirect if not logged in or not admin
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

  // 🔹 Skeleton Loading UI
  if (sessionLoading || !session) {
    return (
      <div className="flex min-h-screen bg-[#0f0f17] text-white overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-64 bg-[#141428]/90 border-r border-gray-800 backdrop-blur-lg p-6 flex flex-col gap-6">
          <Skeleton.Avatar active size={64} shape="circle" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </aside>

        {/* Main Section Skeleton */}
        <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
          <Skeleton.Input
            active
            size="large"
            style={{ width: "40%", marginBottom: "1.5rem" }}
          />
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#161624]/90 border border-gray-800 rounded-2xl p-6 shadow-lg"
              >
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Chart Data
  const chartData = [
    { name: "Jan", Roadmaps: 3, Questions: 12, Learners: 50 },
    { name: "Feb", Roadmaps: 4, Questions: 15, Learners: 80 },
    { name: "Mar", Roadmaps: 5, Questions: 20, Learners: 120 },
    { name: "Apr", Roadmaps: 7, Questions: 28, Learners: 200 },
    { name: "May", Roadmaps: 8, Questions: 30, Learners: 280 },
    { name: "Jun", Roadmaps: 10, Questions: 35, Learners: 350 },
  ];

  // Menu Items with routes
  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Dashboard", route: "/admin/dashboard" },
    { key: "2", icon: <BranchesOutlined />, label: "Roadmaps", route: "/admin/roadmaps" },
    { key: "3", icon: <QuestionCircleOutlined />, label: "Questions", route: "/admin/questions" },
    { key: "4", icon: <SettingOutlined />, label: "Settings", route: "/admin/settings" },
    { key: "6", icon: <LogoutOutlined />, label: "Logout", route: "/logout" },
   
  ];

  // Handle menu click
  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (!item) return;

    if (item.key === "5") {
      // Logout
      message.success("Logged out successfully!");
      setSession(null); // Clear session from context
      localStorage.removeItem("session"); // Optional: clear localStorage
      navigate("/login");
    } else {
      navigate(item.route);
      setOpen(false); // close drawer on mobile
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0a0a14] via-[#111122] to-[#1c1c2e] text-white overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-72 bg-[#10101a]/70 backdrop-blur-2xl border-r border-gray-800 p-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 border-b border-gray-700 pb-6 mb-6"
        >
          <Avatar
            size={70}
            src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
          />
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {session?.fullname || "Admin User"}
            </h2>
            <p className="text-sm text-gray-400 capitalize">
              {session?.role || "admin"}
            </p>
          </div>
        </motion.div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={menuItems}
          className="bg-transparent text-gray-300"
          onClick={handleMenuClick}
        />
      </div>

      {/* Drawer - Mobile */}
      <Drawer
        title={
          <div className="flex flex-col items-center gap-2">
            <Avatar
              size={64}
              src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
            />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">
                {session?.fullname || "Admin"}
              </h3>
              <p className="text-gray-400 text-sm capitalize">
                {session?.role || "admin"}
              </p>
            </div>
          </div>
        }
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{
          backgroundColor: "#0f0f17",
          color: "#fff",
          padding: 0,
        }}
        headerStyle={{
          backgroundColor: "#0f0f17",
          borderBottom: "1px solid #333",
        }}
      >
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={menuItems}
          className="bg-transparent text-gray-300"
          onClick={handleMenuClick}
        />
      </Drawer>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Admin Dashboard 🚀
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-white text-2xl"
          >
            <MenuOutlined />
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl border border-gray-700 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-gradient-to-br from-blue-900/20 to-blue-700/10"
          >
            <h3 className="text-gray-400 mb-2">Total Roadmaps</h3>
            <p className="text-4xl font-bold text-blue-400">
              {stats.roadmaps}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl border border-gray-700 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-gradient-to-br from-green-900/20 to-green-700/10"
          >
            <h3 className="text-gray-400 mb-2">Total Questions</h3>
            <p className="text-4xl font-bold text-green-400">
              {stats.questions}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl border border-gray-700 shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-gradient-to-br from-yellow-900/20 to-yellow-700/10"
          >
            <h3 className="text-gray-400 mb-2">Active Learners</h3>
            <p className="text-4xl font-bold text-yellow-400">
              {stats.learners}
            </p>
          </motion.div>
        </div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#151523]/80 border border-gray-800 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)] p-6 md:p-8"
        >
          <h2 className="text-lg font-semibold mb-6 text-gray-300 text-center">
            Platform Growth Analytics 📈
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f2f3d" />
              <XAxis dataKey="name" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#11111b",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="Roadmaps" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Questions" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Line
                type="monotone"
                dataKey="Learners"
                stroke="#facc15"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
