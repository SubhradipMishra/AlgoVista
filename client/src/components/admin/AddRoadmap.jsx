"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  MenuOutlined,
  DashboardOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
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
  const [editingRoadmap, setEditingRoadmap] = useState(null); // ✅ For edit mode

  const { session, sessionLoading } = useContext(Context);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // ✅ Fetch Tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const res = await axios.get("http://localhost:4000/tags", {
          withCredentials: true,
        });
        setTags(Array.isArray(res.data) ? res.data : []);
      } catch {
        message.error("Failed to load tags");
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  // ✅ Session Check
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

  // ✅ Fetch Roadmaps
  const fetchRoadmaps = async () => {
    try {
      setTableLoading(true);
      const res = await axios.get("http://localhost:4000/roadmap", {
        withCredentials: true,
      });
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

  // ✅ Delete Roadmap
  const handleDelete = async (id) => {
    confirm({
      title: "Are you sure you want to delete this roadmap?",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      content: "This action cannot be undone.",
      okText: "Yes, delete it",
      cancelText: "Cancel",
      okType: "danger",
      centered: true,
      async onOk() {
        try {
          await axios.delete(`http://localhost:4000/roadmap/${id}`, {
            withCredentials: true,
          });
          message.success("Roadmap deleted successfully!");
          fetchRoadmaps();
        } catch (err) {
          console.error("Delete error:", err.response || err);
          message.error(err.response?.data?.message || "Failed to delete roadmap");
        }
      },
    });
  };

  // ✅ Edit Roadmap
  const handleEdit = (roadmap) => {
    setEditingRoadmap(roadmap);
    // Fill form with roadmap data
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

  // ✅ Submit Roadmap (Add/Edit)
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        order: Number(values.order),
        createdBy: session?._id,
      };

      if (editingRoadmap) {
        // ✅ Update existing roadmap
        await axios.put(`http://localhost:4000/roadmap/${editingRoadmap._id}`, payload, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        message.success("Roadmap updated successfully!");
        setEditingRoadmap(null);
      } else {
        // ✅ Add new roadmap
        await axios.post("http://localhost:4000/roadmap", payload, {
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
    if (item.key === "5") {
      message.success("Logged out!");
      navigate("/login");
    } else {
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
    <div className="min-h-screen flex bg-[#0c0c16] text-white">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-[#11111f] border-r border-gray-800 p-6">
        <div className="flex flex-col items-center gap-3 border-b border-gray-700 pb-6 mb-6">
          <Avatar size={70} src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">{session?.fullname || "Admin User"}</h2>
            <p className="text-sm text-gray-400 capitalize">{session?.role || "admin"}</p>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["2"]}
          items={menuItems}
          className="bg-transparent text-gray-300"
          onClick={handleMenuClick}
        />
      </div>

      {/* Drawer for Mobile */}
      <Drawer
        title={
          <div className="flex flex-col items-center gap-2">
            <Avatar size={64} src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">{session?.fullname || "Admin"}</h3>
              <p className="text-gray-400 text-sm capitalize">{session?.role || "admin"}</p>
            </div>
          </div>
        }
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ backgroundColor: "#0f0f17", color: "#fff", padding: 0 }}
        headerStyle={{ backgroundColor: "#0f0f17", borderBottom: "1px solid #333" }}
      >
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["2"]}
          items={menuItems}
          className="bg-transparent text-gray-300"
          onClick={handleMenuClick}
        />
      </Drawer>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-blue-400">
            {editingRoadmap ? "Edit Roadmap" : "Add New Roadmap"}
          </h1>
          <button onClick={() => setOpen(true)} className="md:hidden text-white text-2xl">
            <MenuOutlined />
          </button>
        </div>

        {/* Form */}
        <div className="bg-[#13132a] border border-gray-800 rounded-xl p-6 mb-10">
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item label="Module Title" name="moduleTitle" rules={[{ required: true }]}>
              <Input placeholder="Enter module title" />
            </Form.Item>

            <Form.Item label="Order" name="order" rules={[{ required: true }]} className="!text-white">
              <Input type="number" placeholder="Enter order" />
            </Form.Item>

            <Form.Item label="Description" name="description" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="Enter roadmap description" />
            </Form.Item>

            <Form.Item label="Difficulty" name="difficulty" rules={[{ required: true }]}>
              <Select placeholder="Select difficulty">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Tags" name="tags">
              {tagsLoading ? (
                <Spin tip="Loading tags..." />
              ) : (
                <Select mode="multiple" placeholder="Select or add tags" allowClear>
                  {tags.map((tag) => (
                    <Option key={tag._id || tag.title} value={tag.title}>
                      {tag.title}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>

            <Form.List name="subtopics">
              {(fields, { add, remove }) => (
                <>
                  <h3 className="text-md font-semibold text-blue-400 mb-3">Subtopics</h3>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} className="mb-4 bg-[#101020] border border-gray-700">
                      <Space direction="vertical" className="w-full">
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Subtopic Name"
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Enter subtopic name" />
                        </Form.Item>

                        <Form.List name={[name, "resources"]}>
                          {(resFields, { add: addRes, remove: removeRes }) => (
                            <>
                              {resFields.map(({ key: rKey, name: rName, ...rRest }) => (
                                <Space key={rKey} direction="horizontal" className="w-full">
                                  <Form.Item
                                    {...rRest}
                                    name={[rName, "title"]}
                                    label="Resource Title"
                                    rules={[{ required: true }]}
                                    className="flex-1"
                                  >
                                    <Input placeholder="Enter resource title" />
                                  </Form.Item>
                                  <Form.Item
                                    {...rRest}
                                    name={[rName, "link"]}
                                    label="Resource Link"
                                    rules={[{ required: true }]}
                                    className="flex-1"
                                  >
                                    <Input placeholder="Enter resource link" />
                                  </Form.Item>
                                  <Button danger onClick={() => removeRes(rName)}>
                                    Delete
                                  </Button>
                                </Space>
                              ))}
                              <Button type="dashed" onClick={() => addRes()}>
                                Add Resource
                              </Button>
                            </>
                          )}
                        </Form.List>
                        <Button danger onClick={() => remove(name)}>
                          Remove Subtopic
                        </Button>
                      </Space>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()}>
                    Add Subtopic
                  </Button>
                </>
              )}
            </Form.List>

            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!mt-10 !ml-80 w-100 !h-15"
              >
                {editingRoadmap ? "Update Roadmap" : "Add Roadmap"}
              </Button>
              {editingRoadmap && (
                <Button
                  type="default"
                  className="!ml-4"
                  onClick={() => {
                    setEditingRoadmap(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>

        {/* Table */}
        <div className="bg-[#13132a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-blue-400 font-semibold text-lg mb-4">Your Created Roadmaps</h2>
          <Table
            dataSource={roadmaps}
            columns={columns}
            rowKey="_id"
            loading={tableLoading}
            pagination={false}
            className="text-white"
          />
          <div className="flex justify-center mt-6">
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={(p) => {
                setPage(p);
                fetchRoadmaps();
              }}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoadmap;
