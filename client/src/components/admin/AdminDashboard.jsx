"use client";
import React, { useState, useEffect, useContext } from "react";
import { MenuOutlined } from "@ant-design/icons";
import { Skeleton, message } from "antd";
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
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);

  const [stats] = useState({
    roadmaps: 14,
    questions: 92,
    learners: 540,
  });

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
    <div className="min-h-screen flex bg-black text-white font-mono overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar session={session} open={open} setOpen={setOpen} />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {/* Mobile Menu Button */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
            Admin Dashboard
          </h1>
          <button onClick={() => setOpen(true)} className="md:hidden text-white text-2xl">
            <MenuOutlined />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {[
            { title: "Total Roadmaps", value: stats.roadmaps },
            { title: "Total Questions", value: stats.questions },
            { title: "Active Learners", value: stats.learners },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl border border-gray-700 shadow-lg bg-gray-900"
            >
              <h3 className="text-gray-400 mb-2">{item.title}</h3>
              <p className="text-4xl font-bold text-white">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-lg font-semibold mb-6 text-center text-gray-300">
            Platform Growth Analytics
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#bbb" }} />
              <Bar dataKey="Roadmaps" fill="#fff" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Questions" fill="#bbb" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="Learners" stroke="#fff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
