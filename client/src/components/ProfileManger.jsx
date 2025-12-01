"use client";
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Button, Upload, Space, Select } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserSidebar from "./UserSidebar";
import Context from "../util/context";

const { TextArea } = Input;
const { Option } = Select;

// Editable Field Component
const EditableField = ({ label, name, component, editField, setEditField, onSave, value }) => {
  const [tempValue, setTempValue] = useState(value);
  useEffect(() => setTempValue(value), [value]);

  const handleSave = async () => {
    try {
      await onSave({ [name]: tempValue });
      setEditField(null);
      toast.success(`${label} updated`);
    } catch {
      toast.error(`Failed to update ${label}`);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4 font-mono">
      <div className="flex justify-between items-center px-4">
        <span className="text-gray-400 text-xs uppercase font-semibold tracking-wide">{label}</span>
        {editField === name ? (
          <Space>
            <Button type="text" onClick={() => setEditField(null)} className="text-gray-400 hover:text-red-500">
              Cancel
            </Button>
            <Button type="text" onClick={handleSave} className="text-gray-300 hover:text-white">
              Save
            </Button>
          </Space>
        ) : (
          <Button type="text" onClick={() => setEditField(name)} className="text-gray-400 hover:text-white">
            Edit
          </Button>
        )}
      </div>
      {editField === name ? (
        React.cloneElement(component, {
          value: tempValue,
          onChange: (e) => setTempValue(e?.target ? e.target.value : e),
          className: "bg-black text-white border border-gray-700 rounded-none font-mono",
        })
      ) : (
        <div className="bg-gray-900 px-4 py-2 border border-gray-700 text-gray-300 text-sm min-h-[38px] font-mono">
          {Array.isArray(value) ? value.join(", ") : value || <span className="italic text-gray-500">Not provided</span>}
        </div>
      )}
    </div>
  );
};

const ProfileManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useContext(Context);
  const [userData, setUserData] = useState(null);
  const [editField, setEditField] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedKey, setSelectedKey] = useState("2");

  useEffect(() => {
    if (!session?.id) return;
    if (session.role !== "user") navigate("/");
  }, [session, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/auth/user/${id}`, { withCredentials: true });
        setUserData(res.data.user || res.data);
      } catch {
        toast.error("Failed to load user data");
      }
    };
    const fetchSkills = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/skills", { withCredentials: true });
        setAllSkills(data.map((s) => s.title));
      } catch {
        toast.error("Failed to fetch skills");
      }
    };
    fetchUser();
    fetchSkills();
  }, [id]);

  const updateField = async (updatedValue) => {
    try {
      const res = await axios.put(
        `http://localhost:4000/auth/update/${id}`,
        updatedValue,
        { withCredentials: true }
      );
      setUserData((prev) => ({ ...prev, ...res.data.user }));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleUpload = ({ file }) => {
    const preview = URL.createObjectURL(file);
    updateField({ profileImage: preview });
    setUserData((prev) => ({ ...prev, profileImage: preview }));
    toast.success(`${file.name} uploaded`);
  };

  if (!userData)
    return (
      <div className="flex justify-center items-center h-screen text-white font-mono">Loading profile...</div>
    );

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <div className="flex min-h-screen bg-black text-white overflow-hidden font-mono">
        {/* Sidebar */}
        <UserSidebar
          user={userData}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          navigate={navigate}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <UserOutlined className="text-gray-300" /> Profile
            </h1>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-6 md:p-8 backdrop-blur-md transition-all hover:shadow-gray-700 duration-300">
            {/* Profile Image & Info */}
            <div className="flex items-center gap-4 mb-6">
              <motion.img
                src={userData.profileImage || "/default-avatar.png"}
                alt="Profile"
                className="w-20 h-20 rounded-full border border-gray-700 shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <div>
                <h2 className="text-2xl font-semibold">{userData.fullname}</h2>
                <p className="text-gray-400 text-sm capitalize">{userData.role}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <EditableField
              label="Full Name"
              name="fullname"
              value={userData.fullname}
              editField={editField}
              setEditField={setEditField}
              onSave={updateField}
              component={<Input />}
            />

            <EditableField
              label="Education"
              name="education"
              value={userData.education}
              editField={editField}
              setEditField={setEditField}
              onSave={updateField}
              component={<Input />}
            />

            <EditableField
              label="Skills"
              name="skills"
              value={userData.skills || []}
              editField={editField}
              setEditField={setEditField}
              onSave={updateField}
              component={
                <Select
                  mode="tags"
                  placeholder="Select or add skills"
                  value={userData.skills || []}
                  onChange={(value) => setUserData((prev) => ({ ...prev, skills: value }))}
                  className="bg-black border border-gray-700 text-white rounded-none w-full"
                >
                  {allSkills.map((skill) => (
                    <Option key={skill} value={skill}>{skill}</Option>
                  ))}
                </Select>
              }
            />

            <EditableField
              label="About"
              name="description"
              value={userData.description}
              editField={editField}
              setEditField={setEditField}
              onSave={updateField}
              component={<TextArea rows={4} />}
            />

            {/* Profile Image Upload */}
            <div className="mt-6 mb-4">
              <span className="text-gray-400 text-sm font-medium">Profile Image</span>
              <Space className="mt-2">
                <Upload customRequest={handleUpload} showUploadList={false} accept="image/*">
                  <Button icon={<UploadOutlined />} className="bg-gray-800 text-white border border-gray-700 rounded-none">
                    Upload
                  </Button>
                </Upload>
                {userData.profileImage && (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="w-16 h-16 rounded-none border border-gray-700 shadow-md"
                  />
                )}
              </Space>
            </div>

            {/* Save Button */}
            <Button
              type="primary"
              onClick={() => updateField({})}
              className="w-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 rounded-none"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileManager;
