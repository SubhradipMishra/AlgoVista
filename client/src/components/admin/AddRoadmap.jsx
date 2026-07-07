"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  MenuOutlined,
  PlusCircleOutlined,
  EditOutlined,
  LogoutOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Drawer,
  Menu,
  Avatar,
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Space,
  Spin,
  Table,
  Modal,
  Pagination,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Context from "../../util/context";
import AdminSidebar from "./AdminSidebar";

const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const AddRoadmap = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [roadmaps, setRoadmaps] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [tableLoading, setTableLoading] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);

  const { session, sessionLoading } = useContext(Context);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tags`, { withCredentials: true });
        setTags(Array.isArray(res.data) ? res.data : []);
      } catch {
        message.error("Failed to load tags");
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Session check & fetch roadmaps
  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      message.warning("Please login");
      navigate("/login");
    } else if (session.role !== "admin") {
      message.error("Access denied");
      navigate("/");
    } else {
      fetchRoadmaps();
    }
  }, [session, sessionLoading]);

  // Fetch roadmaps
  const fetchRoadmaps = async () => {
    try {
      setTableLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/roadmap`, { withCredentials: true });
      const all = res.data?.data || [];
      const createdByUser = all.filter(
        (r) => r.createdBy === session?._id || r.createdBy?._id === session?._id
      );
      setTotal(createdByUser.length);
      setRoadmaps(createdByUser.slice((page - 1) * pageSize, page * pageSize));
    } catch {
      message.error("Failed to fetch roadmaps");
    } finally {
      setTableLoading(false);
    }
  };

  // Delete roadmap
  const handleDelete = async (id) => {
    confirm({
      title: "Are you sure you want to delete this roadmap?",
      icon: <ExclamationCircleOutlined style={{ color: "#fff" }} />,
      content: "This action cannot be undone.",
      okText: "Yes, delete it",
      cancelText: "Cancel",
      okType: "danger",
      centered: true,
      async onOk() {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/roadmap/${id}`, { withCredentials: true });
          message.success("Roadmap deleted successfully!");
          fetchRoadmaps();
        } catch (err) {
          console.error(err);
          message.error(err.response?.data?.message || "Failed to delete roadmap");
        }
      },
    });
  };

  // Edit roadmap
  const handleEdit = (roadmap) => {
    setEditingRoadmap(roadmap);
    form.setFieldsValue({
      moduleTitle: roadmap.moduleTitle,
      order: roadmap.order,
      description: roadmap.description,
      difficulty: roadmap.difficulty,
      tags: roadmap.tags,
      subtopics: roadmap.subtopics,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit roadmap
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = { ...values, order: Number(values.order), createdBy: session?._id };

      if (editingRoadmap) {
        await axios.put(`${import.meta.env.VITE_API_URL}/roadmap/${editingRoadmap._id}`, payload, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        message.success("Roadmap updated successfully!");
        setEditingRoadmap(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/roadmap`, payload, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        message.success("Roadmap added successfully!");
      }
      form.resetFields();
      fetchRoadmaps();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to save roadmap");
    } finally {
      setLoading(false);
    }
  };

  // Menu items
  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Dashboard", route: "/admin/dashboard" },
    { key: "2", icon: <PlusCircleOutlined />, label: "Add Roadmap", route: "/admin/roadmaps" },
    { key: "3", icon: <QuestionCircleOutlined />, label: "Questions", route: "/admin/questions" },
    { key: "4", icon: <SettingOutlined />, label: "Settings", route: "/admin/settings" },
    { key: "5", icon: <LogoutOutlined />, label: "Logout", route: "/logout" },
  ];

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (!item) return;
    if (item.key === "5") navigate("/login");
    else {
      navigate(item.route);
      setOpen(false);
    }
  };

  if (sessionLoading) return <div className="text-center text-white p-10">Loading...</div>;

  const columns = [
    { title: "Order", dataIndex: "order", key: "order" },
    { title: "Module Title", dataIndex: "moduleTitle", key: "moduleTitle" },
    { title: "Difficulty", dataIndex: "difficulty", key: "difficulty" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button danger size="small" onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-black text-white font-mono overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar session={session} open={open} setOpen={setOpen} selectedKey="2" menuItems={menuItems} />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-10" />

        <div className="flex items-center justify-between mb-10 border-b border-gray-900 pb-5">
          <div className="flex items-center gap-3">
            <PlusCircleOutlined className="text-3xl text-[var(--primary)]" />
            <h1 className="text-3xl font-black uppercase tracking-wider text-white">
              {editingRoadmap ? "Edit Roadmap" : "Add New Roadmap"}
            </h1>
          </div>
          <button onClick={() => setOpen(true)} className="md:hidden text-white text-2xl hover:text-[var(--primary)] transition-colors">
            <MenuOutlined />
          </button>
        </div>

        {/* Form */}
        <div className="relative overflow-hidden rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-8 shadow-[0_0_50px_rgba(250,204,21,0.03)] mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.03),_transparent_60%)] pointer-events-none" />
          <Form layout="vertical" form={form} onFinish={handleSubmit} className="relative z-10">
            <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Module Title</span>} name="moduleTitle" rules={[{ required: true }]}>
              <Input placeholder="Enter module title" className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono" />
            </Form.Item>

            <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Order</span>} name="order" rules={[{ required: true }]}>
              <Input type="number" placeholder="Enter order" className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono" />
            </Form.Item>

            <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</span>} name="description" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="Enter roadmap description" className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono" />
            </Form.Item>

            <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Difficulty</span>} name="difficulty" rules={[{ required: true }]}>
              <Select placeholder="Select difficulty" className="!bg-[#0c0c10] text-xs font-mono">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>

            <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tags</span>} name="tags">
              {tagsLoading ? (
                <Spin tip="Loading tags..." />
              ) : (
                <Select mode="multiple" placeholder="Select or add tags" allowClear className="!bg-[#0c0c10] text-xs font-mono">
                  {tags.map((tag) => (
                    <Option key={tag._id || tag.title} value={tag.title}>{tag.title}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>

            <Form.List name="subtopics">
              {(fields, { add, remove }) => (
                <div className="mt-8 border-t border-gray-900 pt-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                    <DashboardOutlined className="text-[var(--primary)]" /> Modules Structure
                  </h3>
                  <div className="space-y-6">
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="bg-black border border-gray-900 p-6 rounded-2xl relative overflow-hidden">
                        <Space direction="vertical" className="w-full">
                          <Form.Item {...restField} name={[name, "name"]} label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subtopic Name</span>} rules={[{ required: true }]}>
                            <Input placeholder="Enter subtopic name" className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-2 px-4 shadow-inner font-mono" />
                          </Form.Item>

                          <Form.List name={[name, "resources"]}>
                            {(resFields, { add: addRes, remove: removeRes }) => (
                              <div className="mt-4 p-4 bg-[#07070a] border border-gray-900 rounded-xl space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Attached Resources</h4>
                                {resFields.map(({ key: rKey, name: rName, ...rRest }) => (
                                  <div key={rKey} className="flex flex-col md:flex-row gap-4 items-end">
                                    <Form.Item {...rRest} name={[rName, "title"]} label={<span className="text-[9px] uppercase font-bold text-gray-500">Resource Title</span>} rules={[{ required: true }]} className="flex-1 mb-0 w-full">
                                      <Input placeholder="Enter title" className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-1.5 px-3 font-mono" />
                                    </Form.Item>
                                    <Form.Item {...rRest} name={[rName, "link"]} label={<span className="text-[9px] uppercase font-bold text-gray-500">Resource Link</span>} rules={[{ required: true }]} className="flex-1 mb-0 w-full">
                                      <Input placeholder="Enter link" className="!bg-[#0c0c10] !text-white !border-gray-900 hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl text-xs py-1.5 px-3 font-mono" />
                                    </Form.Item>
                                    <button type="button" onClick={() => removeRes(rName)} className="h-[34px] px-4 bg-red-950 text-red-500 hover:bg-red-900 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">
                                      Del
                                    </button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => addRes()} className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400">
                                  + Add Resource
                                </button>
                              </div>
                            )}
                          </Form.List>
                          <button type="button" onClick={() => remove(name)} className="mt-4 w-full py-2 bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-colors">
                            Remove Subtopic Module
                          </button>
                        </Space>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => add()} className="mt-6 w-full py-3 bg-black border border-[rgba(250,204,21,0.3)] hover:border-[var(--primary)] text-[var(--primary)] hover:text-black hover:bg-[var(--primary)] font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                    + Add New Subtopic
                  </button>
                </div>
              )}
            </Form.List>

            <Form.Item className="mt-10 flex gap-4">
              <button type="submit" disabled={loading} className="px-8 py-3 bg-[var(--primary)] text-black hover:bg-amber-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-md">
                {editingRoadmap ? "Update Roadmap" : "Commit Roadmap To Catalog"}
              </button>
              {editingRoadmap && <button type="button" onClick={() => { setEditingRoadmap(null); form.resetFields(); }} className="ml-4 px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-md">Cancel</button>}
            </Form.Item>
          </Form>
        </div>

        {/* Table */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-900 bg-black p-8 shadow-md">
          <h2 className="text-xs font-black uppercase tracking-widest text-white mb-6">Your Created Roadmaps Archive</h2>
          <Table
            dataSource={roadmaps}
            columns={columns}
            rowKey="_id"
            loading={tableLoading}
            pagination={false}
            className="text-white"
            rowClassName={() => "hover:bg-gray-950 transition-colors bg-black"}
          />
          <div className="flex justify-center mt-6">
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={(p) => { setPage(p); fetchRoadmaps(); }}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoadmap;
