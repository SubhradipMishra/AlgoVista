"use client";
import React, { useEffect, useState, useContext } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Space, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined, DashboardOutlined, BranchesOutlined, QuestionCircleOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Context from "../../util/context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:4000/success-story";

const AdminSuccessStories = () => {
  const { session, sessionLoading, setSession } = useContext(Context);
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  // Session guard
  useEffect(() => {
    if (!sessionLoading) {
      if (!session) navigate("/login");
      else if (session.role !== "admin") {
        toast.error("Access denied! Admins only.");
        navigate("/");
      }
    }
  }, [session, sessionLoading, navigate]);

  // Fetch success stories
  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(BASE_URL);
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch success stories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Delete story
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
      toast.success("Deleted successfully!");
      fetchStories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  // Add or update story
  const handleFormSubmit = async (values) => {
    try {
      // Ensure mentorEmail comes from session when adding
      if (!editingStory) values.mentorEmail = session?.email;
      if (editingStory) {
        await axios.put(`${BASE_URL}/${editingStory._id}`, values, { withCredentials: true });
        toast.success("Updated successfully!");
      } else {
        await axios.post(BASE_URL, values, { withCredentials: true });
        toast.success("Created successfully!");
      }
      setModalVisible(false);
      setEditingStory(null);
      fetchStories();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  // Table columns
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Job Role", dataIndex: "jobrole", key: "jobrole" },
    { title: "Company", dataIndex: "companyname", key: "companyname" },
    { title: "Rating", dataIndex: "rating", key: "rating" },
    { title: "Mentor Email", dataIndex: "mentorEmail", key: "mentorEmail" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingStory(record); setModalVisible(true); }} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
        </Space>
      ),
    },
  ];

  // Sidebar menu items
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
      toast.success("Logged out!");
      setSession(null);
      localStorage.removeItem("session");
      navigate("/login");
    } else {
      navigate(item.route);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0b1c3d] text-white overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-[#11294c]/80 backdrop-blur-2xl border-r border-gray-800 p-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 border-b border-gray-700 pb-6 mb-6">
          <Avatar size={70} src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">{session?.fullname || "Admin User"}</h2>
            <p className="text-sm text-gray-300 capitalize">{session?.role || "admin"}</p>
          </div>
        </motion.div>
        <div className="flex-1">
          {menuItems.map((item) => (
            <Button key={item.key} type="text" className="w-full text-left text-gray-300 mb-2 hover:bg-gray-800" icon={item.icon} onClick={() => handleMenuClick({ key: item.key })}>
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide mb-6">Success Stories ✨</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} className="mb-4">
          Add Success Story
        </Button>

        <Table
          dataSource={Array.isArray(stories) ? stories : []}
          columns={columns}
          rowKey="_id"
          loading={loading}
          bordered
          className="bg-[#15305c]/80"
        />

        <Modal
          title={editingStory ? "Edit Success Story" : "Add Success Story"}
          open={modalVisible}
          onCancel={() => { setModalVisible(false); setEditingStory(null); }}
          footer={null}
          bodyStyle={{ backgroundColor: "#15305c", color: "white" }}
        >
          <Form layout="vertical" initialValues={editingStory || { rating: 0, mentorEmail: session?.email }} onFinish={handleFormSubmit}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter name" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description" }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="jobrole" label="Job Role" rules={[{ required: true, message: "Please enter job role" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="companyname" label="Company Name" rules={[{ required: true, message: "Please enter company name" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="mentorEmail" label="Mentor Email">
              <Input readOnly value={editingStory ? editingStory.mentorEmail : session?.email} />
            </Form.Item>
            <Form.Item name="rating" label="Rating" rules={[{ required: true, message: "Please enter rating" }]}>
              <InputNumber min={0} max={5} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                {editingStory ? "Update" : "Add"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminSuccessStories;
