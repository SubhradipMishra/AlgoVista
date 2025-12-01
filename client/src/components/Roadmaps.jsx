// Roadmaps.jsx
"use client";
import React, { useContext, useState, useEffect } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Select, Input, Tag, Skeleton, Tooltip } from "antd";
import { useNavigate, Link } from "react-router-dom";
import {
  SearchOutlined,
  FireOutlined,
  StarFilled,
  TeamOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Context from "../util/context";
import { getRoadmaps } from "../util/fetcher";
import UserSidebar from "./UserSidebar";
const { Option } = Select;

const Roadmaps = () => {
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      }
    };
    fetchUser();
  }, [session]);

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/login");
    }
  }, [session, sessionLoading, navigate]);

  const { data, error, isLoading } = useSWR("roadmaps", getRoadmaps);
  const roadmaps = data?.data || [];

  const getTagColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "#aaa"; // gray
      case "intermediate":
        return "#888"; // medium gray
      case "hard":
        return "#555"; // dark gray
      default:
        return "#777"; // default gray
    }
  };

  const getTagLabel = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "Beginner Friendly";
      case "intermediate":
        return "Popular";
      case "hard":
        return "Expert Level";
      default:
        return "Featured";
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="flex min-h-screen bg-black text-white overflow-hidden font-mono">
        <UserSidebar user={user} selectedKey="3" setSelectedKey={() => {}} navigate={navigate} />
        <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
          <Skeleton.Input active size="large" style={{ width: "40%", marginBottom: "1.5rem" }} />
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#111]/80 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-lg"
              >
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!session) return null;
  if (error)
    return <div className="text-gray-400 text-center mt-10 font-mono">Failed to load roadmaps.</div>;

  return (
    <div className="flex min-h-screen bg-black text-white overflow-hidden font-mono">
      {user ? (
        <UserSidebar user={user} selectedKey="3" setSelectedKey={() => {}} navigate={navigate} />
      ) : (
        <div className="w-64 bg-black" />
      )}
      <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search roadmap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#111]/80 border-none text-gray-300 w-full md:w-1/3 rounded-2xl py-2 placeholder-gray-500 font-mono"
          />
          <div className="flex flex-wrap gap-3">
            <Select placeholder="Select Domain" className="w-48 bg-[#111]/80 text-gray-300 font-mono">
              <Option value="fullstack">Fullstack</Option>
              <Option value="dsa">DSA</Option>
              <Option value="devops">DevOps</Option>
            </Select>
            <Select placeholder="Select Skill" className="w-48 bg-[#111]/80 text-gray-300 font-mono">
              <Option value="react">React</Option>
              <Option value="node">Node.js</Option>
              <Option value="python">Python</Option>
            </Select>
            <Select placeholder="Select Company" className="w-48 bg-[#111]/80 text-gray-300 font-mono">
              <Option value="google">Google</Option>
              <Option value="amazon">Amazon</Option>
              <Option value="microsoft">Microsoft</Option>
            </Select>
          </div>
        </div>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
          {roadmaps
            .filter((r) => r.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((r) => (
              <motion.div
                key={r._id}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-[#111]/80 border border-gray-800 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] backdrop-blur-lg transition-all font-mono"
              >
                <div className="flex justify-between items-center mb-3">
                  <Tag color={getTagColor(r.difficulty)} className="px-3 py-1 rounded-xl font-semibold flex items-center gap-1">
                    <FireOutlined /> {getTagLabel(r.difficulty)}
                  </Tag>
                  <Tag color="#888" className="px-3 py-1 rounded-xl font-semibold">
                    {r.difficulty}
                  </Tag>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{r.moduleTitle}</h3>
                <p className="text-gray-400 text-sm mb-4">{r.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {r.tags?.map((tag, idx) => (
                    <Tag key={idx} color="#666">
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <Tooltip title="Students Engaged">
                    <span className="flex items-center gap-1 text-gray-300">
                      <TeamOutlined /> {r.learners || 0}+ Students
                    </span>
                  </Tooltip>
                  <span className="flex items-center gap-1 text-gray-300">
                    <StarFilled /> 4.8
                  </span>
                </div>
                <Link
                  to={`/roadmaps/${r._id}`}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 bg-gray-800 text-white font-semibold uppercase rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all duration-300 ease-out active:scale-[0.98]"
                >
                  View Roadmap <ArrowRightOutlined className="text-lg" />
                </Link>
              </motion.div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Roadmaps;
