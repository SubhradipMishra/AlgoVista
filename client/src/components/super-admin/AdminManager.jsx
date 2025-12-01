"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  message,
  Table,
  Space,
  Avatar,
  Tooltip,
  Tag,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import Context from "../../util/context";

const { Option } = Select;

const AdminManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [form] = Form.useForm();
  const [renewForm] = Form.useForm();
  const { session, sessionLoading } = useContext(Context);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");



  console.log(session);
  // 🧩 Fetch all mentors
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:4000/auth/mentorsBySuperMentors",
        { withCredentials: true }
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading && session) fetchUsers();
  }, [session, sessionLoading]);

  const openModal = () => form.resetFields() || setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openImportModal = () => setIsImportOpen(true);
  const closeImportModal = () => {
    setIsImportOpen(false);
    setImportFile(null);
  };

  const handleFileChange = (e) => setImportFile(e.target.files[0]);

  // 📥 Import users (JSON / CSV / Excel)
  const handleImport = async () => {
    if (!importFile) return message.error("Please select a file");

    try {
      let usersData = [];
      if (importFile.type === "application/json") {
        const text = await importFile.text();
        usersData = JSON.parse(text);
      } else {
        const data = await importFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        usersData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

      const validData = usersData.filter(
        (u) => u.fullname && u.email && u.role
      );
      if (!validData.length)
        return message.error("No valid user data found");

      await axios.post(
        "http://localhost:4000/auth/bulk-signup",
        validData,
        { withCredentials: true }
      );

      message.success(`${validData.length} users uploaded successfully!`);
      closeImportModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      message.error("Failed to import users. Check file format and data.");
    }
  };

  // ➕ Create single user
  const handleSubmit = async (values) => {
    try {
     const {data} =  await axios.post("http://localhost:4000/auth/signup", values, {
        withCredentials: true,
      });
      console.log(data);
      message.success("User created successfully!");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to create user");
    }
  };

  // ❌ Delete user
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/auth/users/${id}`, {
        withCredentials: true,
      });
      message.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete user");
    }
  };

  // 🔄 Renew Admin Access
  const openRenewModal = (record) => {
    setSelectedAdmin(record);
    renewForm.resetFields();
    setIsRenewOpen(true);
  };
  const closeRenewModal = () => setIsRenewOpen(false);

  const handleRenew = async (values) => {
    try {
      await axios.post(
        "http://localhost:4000/auth/renew-admin",
        { adminId: selectedAdmin._id, days: values.days },
        { withCredentials: true }
      );
      message.success(
        `Admin access extended by ${values.days} days successfully!`
      );
      closeRenewModal();
    } catch (err) {
      console.error(err);
      message.error("Failed to renew admin access");
    }
  };

  // 🔍 Filters
  const filteredUsers = users.filter(
    (u) =>
      (filterRole === "all" || u.role === filterRole) &&
      u.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🧱 Table Columns
  const columns = [
    {
      title: "Name",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      render: (text) => (
        <span className="font-semibold text-blue-300">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-gray-300">{text}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={role === "admin" ? "purple" : "blue"}
          className="capitalize font-medium px-3 py-1 rounded-full"
        >
          {role === "user" ? "Student" : "Admin"}
        </Tag>
      ),
      filters: [
        { text: "Student", value: "user" },
        { text: "Admin", value: "admin" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit User">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              className="hover:bg-blue-600 hover:text-white transition shadow rounded-lg"
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="hover:bg-red-600 hover:text-white transition shadow rounded-lg"
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
          {record.role === "admin" && (
            <Tooltip title="Renew Admin Access">
              <Button
                type="default"
                icon={<ClockCircleOutlined />}
                size="small"
                className="hover:bg-green-600 hover:text-white transition shadow rounded-lg"
                onClick={() => openRenewModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (sessionLoading)
    return <div className="text-center text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#08080f] to-[#0f1126] text-white font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#111122]/80 backdrop-blur-md border-r border-gray-800 p-6">
        <div className="flex flex-col items-center gap-3 border-b border-gray-700 pb-6 mb-6">
          <Avatar
            size={80}
            src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
          />
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {session?.fullname || "Admin"}
            </h2>
            <p className="text-sm text-gray-400 capitalize">
              {session?.role || "admin"}
            </p>
          </div>
        </div>
        <ul className="space-y-3 text-gray-300">
          {["Dashboard", "Users", "Admins"].map((item) => (
            <li
              key={item}
              className="hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white p-3 rounded-xl cursor-pointer transition transform hover:scale-105"
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Admin Manager
          </h1>
          <div className="flex gap-4">
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={openModal}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 border-none hover:from-indigo-600 hover:to-purple-700 shadow-lg rounded-xl"
            >
              Add User/Admin
            </Button>
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={openImportModal}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-none hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              Import Users
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a1a2e] text-white border border-gray-700 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition w-full md:w-1/3"
          />
          <Select
            value={filterRole}
            onChange={setFilterRole}
            className="bg-[#1a1a2e] text-white border border-gray-700 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition w-full md:w-1/4"
          >
            <Option value="all">All Roles</Option>
            <Option value="user">Student</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </div>

        {/* Users Table */}
        <div className="bg-[#13132a]/70 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-purple-400 font-semibold text-lg mb-4">
            All Mentors
          </h2>
          <Table
            dataSource={filteredUsers}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            className="text-white"
            bordered
            rowClassName={(record, idx) =>
              idx % 2 === 0
                ? "bg-[#15152f]/60 hover:bg-[#1f1f3a]/80 transition"
                : "bg-[#12122a]/60 hover:bg-[#1f1f3a]/80 transition"
            }
          />
        </div>
      </main>

      {/* Add User Modal */}
      <Modal
        title={
          <h2 className="text-white text-lg font-semibold">Add New User/Admin</h2>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        centered
        bodyStyle={{
          backgroundColor: "#0f0f17",
          color: "#fff",
          borderRadius: "16px",
          padding: "2rem",
        }}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[{ required: true, message: "Full Name is required" }]}
          >
            <Input
              placeholder="Enter full name"
              className="bg-[#1a1a2e] text-white border border-gray-700 rounded-xl px-4 py-2"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              placeholder="Enter email"
              className="bg-[#1a1a2e] text-white border border-gray-700 rounded-xl px-4 py-2"
            />
          </Form.Item>
          <Form.Item name="role" label="Role" initialValue="user">
            <Select className="bg-[#1a1a2e] text-white border border-gray-700 rounded-xl">
              <Option value="user">Student</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="createdBy"
            label="Created By"
            initialValue={session?.email || ""}
            rules={[{ required: true }]}
          >
            <Input
              readOnly
              className="bg-[#1a1a2e] text-gray-400 border border-gray-700 rounded-xl px-4 py-2"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none rounded-xl text-white py-3 mt-4 shadow-lg transition"
            >
              Create User
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title={
          <h2 className="text-white text-lg font-semibold">
            Import Users (JSON, CSV, Excel)
          </h2>
        }
        open={isImportOpen}
        onCancel={closeImportModal}
        footer={null}
        centered
        bodyStyle={{
          backgroundColor: "#0f0f17",
          color: "#fff",
          borderRadius: "16px",
          padding: "2rem",
        }}
      >
        <input
          type="file"
          accept=".json,.csv,.xlsx"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:opacity-90 transition"
        />
        <Button
          type="primary"
          block
          onClick={handleImport}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-600 hover:to-purple-700 border-none rounded-xl text-white py-2 shadow-lg"
        >
          Upload & Import
        </Button>
      </Modal>

      {/* Renew Admin Modal */}
      <Modal
        title={
          <h2 className="text-white text-lg font-semibold">
            Renew Admin Access
          </h2>
        }
        open={isRenewOpen}
        onCancel={closeRenewModal}
        footer={null}
        centered
        bodyStyle={{
          backgroundColor: "#0f0f17",
          color: "#fff",
          borderRadius: "16px",
          padding: "2rem",
        }}
        width={400}
      >
        <Form form={renewForm} layout="vertical" onFinish={handleRenew}>
          <Form.Item
            name="days"
            label="Extend Duration (in days)"
            rules={[{ required: true, message: "Please enter number of days" }]}
          >
            <Input
              type="number"
              placeholder="Enter days (e.g. 7)"
              className="bg-[#1a1a2e] text-white border border-gray-700 rounded-xl px-4 py-2"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-none rounded-xl text-white py-3 mt-2 shadow-lg transition"
            >
              Renew Access
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManager;
