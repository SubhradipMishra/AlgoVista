"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  MenuOutlined,
  DashboardOutlined,
  BranchesOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlusOutlined,
  DeleteOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Drawer,
  Menu,
  Avatar,
  Input,
  Popconfirm,
  Skeleton,
  Tag,
  Tabs,
  Button,
  Form,
} from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Context from "../../util/context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { TabPane } = Tabs;

const AdminSettings = () => {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const { session, sessionLoading, setSession } = useContext(Context);
  const navigate = useNavigate();

  // ✅ Protect route
  useEffect(() => {
    if (!sessionLoading) {
      if (!session) navigate("/login");
      else if (session.role !== "admin") {
        toast.error("Admins only!");
        navigate("/");
      }
    }
  }, [session, sessionLoading, navigate]);

  // ✅ Fetch All Data
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
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ✅ Generic Add / Delete Handlers
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
      await axios.delete(`http://localhost:4000/${type}/${id}`, {
        withCredentials: true,
      });
      toast.success(`${type} deleted!`);
      fetchAll();
    } catch {
      toast.error(`Failed to delete ${type}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change Password Handler
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      const res = await axios.put(
        "http://localhost:4000/auth/change-password",
        values,
        { withCredentials: true }
      );

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

  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Dashboard", route: "/admin/dashboard" },
    { key: "2", icon: <BranchesOutlined />, label: "Roadmaps", route: "/admin/roadmaps" },
    { key: "3", icon: <QuestionCircleOutlined />, label: "Questions", route: "/admin/questions" },
    { key: "4", icon: <SettingOutlined />, label: "Settings", route: "/admin/settings" },
    { key: "5", icon: <LogoutOutlined />, label: "Logout", route: "/logout" },
  ];

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (!item) return;
    if (item.key === "5") {
      toast.success("Logged out successfully!");
      setSession(null);
      localStorage.removeItem("session");
      navigate("/login");
    } else {
      navigate(item.route);
      setOpen(false);
    }
  };

  if (sessionLoading || !session) {
    return (
      <div className="flex min-h-screen bg-[#0f0f17] text-white overflow-hidden">
        <aside className="w-64 bg-[#141428]/90 border-r border-gray-800 backdrop-blur-lg p-6 flex flex-col gap-6">
          <Skeleton.Avatar active size={64} shape="circle" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </aside>
        <main className="flex-1 px-8 py-10">
          <Skeleton.Input active size="large" style={{ width: "40%" }} />
          <div className="mt-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0a0a14] via-[#111122] to-[#1c1c2e] text-white overflow-hidden">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-[#10101a]/70 backdrop-blur-2xl border-r border-gray-800 p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 border-b border-gray-700 pb-6 mb-6"
        >
          <Avatar
            size={70}
            src={session?.profileImage || "https://avatars.githubusercontent.com/u/9919?s=200&v=4"}
          />
          <div className="text-center">
            <h2 className="text-lg font-semibold">{session?.fullname || "Admin User"}</h2>
            <p className="text-sm text-gray-400 capitalize">{session?.role || "admin"}</p>
          </div>
        </motion.div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={menuItems}
          className="bg-transparent text-gray-300"
          onClick={handleMenuClick}
        />
      </div>

      {/* Drawer (mobile) */}
      <Drawer
        placement="left"
        title={
          <div className="flex flex-col items-center gap-2">
            <Avatar
              size={64}
              src={session?.profileImage || "https://avatars.githubusercontent.com/u/9919?s=200&v=4"}
            />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">{session?.fullname || "Admin"}</h3>
              <p className="text-gray-400 text-sm capitalize">{session?.role || "admin"}</p>
            </div>
          </div>
        }
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ backgroundColor: "#0f0f17", color: "#fff", padding: 0 }}
        headerStyle={{ backgroundColor: "#0f0f17", borderBottom: "1px solid #333" }}
      >
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={menuItems}
          className="bg-transparent text-gray-300"
          onClick={handleMenuClick}
        />
      </Drawer>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 relative">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide flex items-center gap-3">
            <SettingOutlined className="text-cyan-400" />
            Admin Panel ⚙️
          </h1>
          <button onClick={() => setOpen(true)} className="md:hidden text-white text-2xl">
            <MenuOutlined />
          </button>
        </div>

        <motion.div
          className="bg-[#151523]/90 border border-gray-800 rounded-3xl shadow-2xl p-6 md:p-10 backdrop-blur-md"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultActiveKey="1" centered animated className="text-white">
            {/* TOPICS */}
            <TabPane tab="Topics" key="1">
              <AddSection
                placeholder="Enter topic name..."
                value={newTopic}
                onChange={setNewTopic}
                onAdd={() => handleAdd("topics", newTopic, setNewTopic)}
                data={topics}
                color="cyan"
                onDelete={(id) => handleDelete("topics", id)}
              />
            </TabPane>

            {/* TAGS */}
            <TabPane tab="Tags" key="2">
              <AddSection
                placeholder="Enter tag name..."
                value={newTag}
                onChange={setNewTag}
                onAdd={() => handleAdd("tags", newTag, setNewTag)}
                data={tags}
                color="magenta"
                onDelete={(id) => handleDelete("tags", id)}
              />
            </TabPane>

            {/* SKILLS */}
            <TabPane tab="Skills" key="3">
              <AddSection
                placeholder="Enter skill name..."
                value={newSkill}
                onChange={setNewSkill}
                onAdd={() => handleAdd("skills", newSkill, setNewSkill)}
                data={skills}
                color="blue"
                onDelete={(id) => handleDelete("skills", id)}
                plain
              />
            </TabPane>

            {/* CHANGE PASSWORD */}
            <TabPane
              tab={
                <span>
                  <LockOutlined /> Change Password
                </span>
              }
              key="4"
            >
              <div className="max-w-md mx-auto mt-10 p-6 bg-[#111124]/90 border border-gray-800 rounded-2xl shadow-lg backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400 flex items-center justify-center gap-2">
                  <LockOutlined /> Secure Account
                </h2>

                <Form layout="vertical" onFinish={handleChangePassword} className="space-y-4">
                  <Form.Item
                    name="oldPassword"
                    label={<span className="text-gray-300 font-medium">Old Password</span>}
                    rules={[{ required: true, message: "Please enter old password" }]}
                  >
                    <Input.Password
                      placeholder="Enter old password"
                      className="!bg-[#0f0f17] !text-white border border-gray-700 hover:border-cyan-500 focus:border-cyan-400 transition-all duration-200 rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label={<span className="text-gray-300 font-medium">New Password</span>}
                    rules={[{ required: true, message: "Please enter new password" }]}
                  >
                    <Input.Password
                      placeholder="Enter new password"
                      className="!bg-[#0f0f17] !text-white border border-gray-700 hover:border-cyan-500 focus:border-cyan-400 transition-all duration-200 rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={<span className="text-gray-300 font-medium">Confirm Password</span>}
                    rules={[{ required: true, message: "Please confirm password" }]}
                  >
                    <Input.Password
                      placeholder="Confirm new password"
                      className="!bg-[#0f0f17] !text-white border border-gray-700 hover:border-cyan-500 focus:border-cyan-400 transition-all duration-200 rounded-lg"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    className="mt-5 py-2 text-base font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-700/40 transition-all duration-300"
                  >
                    Change Password
                  </Button>
                </Form>
              </div>
            </TabPane>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

// ✅ Reusable Add + List Component
const AddSection = ({ placeholder, value, onChange, onAdd, data, color, onDelete, plain }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="!bg-[#0f0f17] !text-white border border-gray-700 w-full md:w-2/3 rounded-lg focus:border-cyan-400 transition-all duration-200"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          className="text-white font-semibold shadow-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {data.length === 0 && <p className="text-gray-500 italic">No items yet.</p>}
        {data.map((item) => (
          <motion.div
            key={item._id}
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-2 border border-gray-700 px-3 py-1.5 rounded-full shadow-sm ${
              plain ? "bg-transparent" : "bg-[#111124]"
            }`}
          >
            <Tag
              color={plain ? undefined : color}
              className="!m-0 !border-0 !px-2 !py-1 !rounded-full capitalize"
            >
              {item.title}
            </Tag>
            <Popconfirm
              title="Delete this item?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => onDelete(item._id)}
            >
              <DeleteOutlined className="text-red-400 hover:text-red-500 cursor-pointer" />
            </Popconfirm>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default AdminSettings;
