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
        axios.get("http://localhost:4000/topics", { withCredentials: true }),
        axios.get("http://localhost:4000/tags", { withCredentials: true }),
        axios.get("http://localhost:4000/skills", { withCredentials: true }),
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
        `http://localhost:4000/${type}`,
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
      await axios.delete(`http://localhost:4000/${type}/${id}`, { withCredentials: true });
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
      const res = await axios.put("http://localhost:4000/auth/change-password", values, { withCredentials: true });
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
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <SettingOutlined /> Admin Panel
        </h1>

        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultActiveKey="1" centered animated className="text-white">
            {/* Topics */}
            <TabPane tab="Topics" key="1">
              <AddSection
                placeholder="Enter topic name..."
                value={newTopic}
                onChange={setNewTopic}
                onAdd={() => handleAdd("topics", newTopic, setNewTopic)}
                data={topics}
                color="white"
                onDelete={(id) => handleDelete("topics", id)}
              />
            </TabPane>

            {/* Tags */}
            <TabPane tab="Tags" key="2">
              <AddSection
                placeholder="Enter tag name..."
                value={newTag}
                onChange={setNewTag}
                onAdd={() => handleAdd("tags", newTag, setNewTag)}
                data={tags}
                color="white"
                onDelete={(id) => handleDelete("tags", id)}
              />
            </TabPane>

            {/* Skills */}
            <TabPane tab="Skills" key="3">
              <AddSection
                placeholder="Enter skill name..."
                value={newSkill}
                onChange={setNewSkill}
                onAdd={() => handleAdd("skills", newSkill, setNewSkill)}
                data={skills}
                color="white"
                onDelete={(id) => handleDelete("skills", id)}
                plain
              />
            </TabPane>

            {/* Change Password */}
            <TabPane tab={<span><LockOutlined /> Change Password</span>} key="4">
              <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 border border-gray-700 rounded-xl">
                <Form layout="vertical" onFinish={handleChangePassword} className="space-y-4">
                  <Form.Item name="oldPassword" label="Old Password" rules={[{ required: true }]}>
                    <Input.Password className="!bg-black !text-white border border-gray-700 rounded-lg" />
                  </Form.Item>
                  <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
                    <Input.Password className="!bg-black !text-white border border-gray-700 rounded-lg" />
                  </Form.Item>
                  <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }]}>
                    <Input.Password className="!bg-black !text-white border border-gray-700 rounded-lg" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block className="bg-white text-black hover:bg-gray-200">
                    Change Password
                  </Button>
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
const AddSection = ({ placeholder, value, onChange, onAdd, data, color, onDelete, plain }) => (
  <>
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="!bg-black !text-white border border-gray-700 w-full md:w-2/3 rounded-lg"
      />
      <Button type="primary" onClick={onAdd} className="bg-white text-black hover:bg-gray-200">
        Add
      </Button>
    </div>

    <div className="flex flex-wrap gap-3 mt-4">
      {data.length === 0 && <p className="text-gray-500 italic">No items yet.</p>}
      {data.map((item) => (
        <div key={item._id} className={`flex items-center gap-2 border border-gray-700 px-3 py-1.5 rounded-full ${plain ? "bg-black" : "bg-gray-800"}`}>
          <Tag color={plain ? undefined : color} className="!m-0 !border-0 !px-2 !py-1 !rounded-full capitalize">
            {item.title}
          </Tag>
          <Popconfirm title="Delete this item?" okText="Yes" cancelText="No" onConfirm={() => onDelete(item._id)}>
            <span className="text-red-400 hover:text-red-500 cursor-pointer">x</span>
          </Popconfirm>
        </div>
      ))}
    </div>
  </>
);

export default AdminSettings;
