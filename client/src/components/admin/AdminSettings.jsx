"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  SettingOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Tabs,
  Button,
  Input,
  Form,
  Popconfirm,
  Tag,
} from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Context from "../../util/context";
import AdminSidebar from "./AdminSidebar";

const { TabPane } = Tabs;

const AdminSettings = () => {
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const { session, sessionLoading, setSession } = useContext(Context);
  const navigate = useNavigate();

  // Protect route
  useEffect(() => {
    if (!sessionLoading) {
      if (!session) navigate("/login");
      else if (session.role !== "admin") {
        toast.error("Admins only!");
        navigate("/");
      }
    }
  }, [session, sessionLoading, navigate]);

  // Fetch all data
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [topicsRes, tagsRes, skillsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/topics`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/tags`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/skills`, { withCredentials: true }),
      ]);
      setTopics(topicsRes.data || []);
      setTags(tagsRes.data || []);
      setSkills(skillsRes.data || []);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAdd = async (type, value, setValue) => {
    if (!value.trim()) return toast.warning(`${type} name required!`);
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/${type}`,
        { title: value },
        { withCredentials: true }
      );
      toast.success(`${type} added!`);
      setValue("");
      fetchAll();
    } catch {
      toast.error(`Failed to add ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/${type}/${id}`, { withCredentials: true });
      toast.success(`${type} deleted!`);
      fetchAll();
    } catch {
      toast.error(`Failed to delete ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/change-password`, values, { withCredentials: true });
      toast.success(res.data.message || "Password changed successfully!");
      setTimeout(() => {
        setSession(null);
        localStorage.removeItem("session");
        navigate("/login");
      }, 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || !session) return null;

  return (
    <div className="flex min-h-screen font-mono text-white bg-black">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      {/* Sidebar */}
      <AdminSidebar session={session} />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 relative overflow-hidden">
        {/* Decorative Grid & Blur */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-10" />

        <div className="flex items-center gap-3 mb-10 border-b border-gray-900 pb-5">
          <SettingOutlined className="text-3xl text-[var(--primary)]" />
          <h1 className="text-3xl font-black uppercase tracking-wider text-white">Platform Settings</h1>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-8 shadow-[0_0_50px_rgba(250,204,21,0.03)]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.03),_transparent_60%)] pointer-events-none" />

          <Tabs defaultActiveKey="1" animated className="premium-tabs relative z-10">
            {/* Topics */}
            <TabPane tab={<span className="text-xs font-black uppercase tracking-widest px-2">Topics</span>} key="1">
              <AddSection
                placeholder="Enter topic name..."
                value={newTopic}
                onChange={setNewTopic}
                onAdd={() => handleAdd("topics", newTopic, setNewTopic)}
                data={topics}
                onDelete={(id) => handleDelete("topics", id)}
              />
            </TabPane>

            {/* Tags */}
            <TabPane tab={<span className="text-xs font-black uppercase tracking-widest px-2">Tags</span>} key="2">
              <AddSection
                placeholder="Enter tag name..."
                value={newTag}
                onChange={setNewTag}
                onAdd={() => handleAdd("tags", newTag, setNewTag)}
                data={tags}
                onDelete={(id) => handleDelete("tags", id)}
              />
            </TabPane>

            {/* Skills */}
            <TabPane tab={<span className="text-xs font-black uppercase tracking-widest px-2">Skills</span>} key="3">
              <AddSection
                placeholder="Enter skill name..."
                value={newSkill}
                onChange={setNewSkill}
                onAdd={() => handleAdd("skills", newSkill, setNewSkill)}
                data={skills}
                onDelete={(id) => handleDelete("skills", id)}
              />
            </TabPane>

            {/* Change Password */}
            <TabPane tab={<span className="text-xs font-black uppercase tracking-widest px-2"><LockOutlined /> Change Password</span>} key="4">
              <div className="max-w-md mt-6 p-6 bg-black border border-gray-900 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-[0.02] rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
                <Form layout="vertical" onFinish={handleChangePassword} className="space-y-4">
                  <Form.Item name="oldPassword" label={<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Old Password</span>} rules={[{ required: true }]}>
                    <Input.Password className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono" />
                  </Form.Item>
                  <Form.Item name="newPassword" label={<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">New Password</span>} rules={[{ required: true }]}>
                    <Input.Password className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono" />
                  </Form.Item>
                  <Form.Item name="confirmPassword" label={<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confirm Password</span>} rules={[{ required: true }]}>
                    <Input.Password className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono" />
                  </Form.Item>
                  <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-[var(--primary)] text-black hover:bg-amber-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-md">
                    Update Password
                  </button>
                </Form>
              </div>
            </TabPane>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

// Reusable Add + List Component
const AddSection = ({ placeholder, value, onChange, onAdd, data, onDelete }) => (
  <div className="pt-4 space-y-8">
    <div className="flex flex-col md:flex-row items-center gap-4">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="!bg-black !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] w-full md:w-2/3 !rounded-xl py-2 px-4 text-xs font-mono shadow-inner"
      />
      <button onClick={onAdd} className="px-8 py-2.5 bg-[var(--primary)] text-black hover:bg-amber-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-md w-full md:w-auto">
        Add Entry
      </button>
    </div>

    <div className="flex flex-wrap gap-4 p-6 bg-black border border-gray-950 rounded-2xl min-h-[150px]">
      {data.length === 0 && <p className="text-gray-600 text-xs italic my-auto w-full text-center">No catalog entries yet.</p>}
      {data.map((item) => (
        <div key={item._id} className="group relative flex items-center gap-2 border border-gray-900 bg-[#0c0c10] px-4 py-2 rounded-xl hover:border-[var(--primary)] transition-all">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
            {item.title}
          </span>
          <Popconfirm title="Delete this entry?" okText="Confirm" cancelText="Cancel" onConfirm={() => onDelete(item._id)}>
            <span className="text-gray-700 hover:text-red-500 cursor-pointer text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
          </Popconfirm>
        </div>
      ))}
    </div>
  </div>
);

export default AdminSettings;
