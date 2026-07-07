"use client";
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Button, Upload, Space, Select } from "antd";
import { UploadOutlined, UserOutlined, SaveOutlined, EditOutlined, CloseOutlined, ThunderboltOutlined } from "@ant-design/icons";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserSidebar from "./UserSidebar";
import Context from "../util/context";

const { TextArea } = Input;
const { Option } = Select;

// Editable Field Component with Premium Sci-Fi aesthetics
const EditableField = ({
  label,
  name,
  component,
  editField,
  setEditField,
  onSave,
  value,
}) => {
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
    <div className="flex flex-col gap-2 mb-6 font-mono relative">
      <div className="flex justify-between items-center px-4">
        <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">
          ◈ {label}
        </span>
        {editField === name ? (
          <Space>
            <button
              onClick={() => setEditField(null)}
              className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <CloseOutlined /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <SaveOutlined /> Save
            </button>
          </Space>
        ) : (
          <button
            onClick={() => setEditField(name)}
            className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <EditOutlined /> Edit
          </button>
        )}
      </div>

      {editField === name ? (
        React.cloneElement(component, {
          value: tempValue,
          onChange: (e) =>
            setTempValue(e?.target ? e.target.value : e),
          className:
            "!bg-black !text-white !border-[rgba(250,204,21,0.25)] hover:!border-[var(--primary)] focus:!border-[var(--primary)] !rounded-xl font-mono !shadow-none",
        })
      ) : (
        <div className="bg-[#07070a] px-4 py-3 border border-gray-950 rounded-xl text-gray-300 text-xs min-h-[38px] font-mono flex items-center leading-relaxed">
          {Array.isArray(value)
            ? value.join(", ")
            : value || (
                <span className="italic text-gray-600 font-bold uppercase tracking-wide text-[10px]">
                  Not configured
                </span>
              )}
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
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!session?.id) return;
    if (session.role !== "user" && session.role !== "admin") {
      navigate("/");
    }
  }, [session, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/user/${id}`,
          { withCredentials: true }
        );
        setUserData(res.data.user || res.data);
      } catch {
        toast.error("Failed to load user data");
      }
    };

    const fetchSkills = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/skills`,
          { withCredentials: true }
        );
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
        `${import.meta.env.VITE_API_URL}/auth/update/${id}`,
        updatedValue,
        { withCredentials: true }
      );
      setUserData((prev) => ({
        ...prev,
        ...res.data.user,
      }));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/upload-profile-image/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUserData((prev) => ({
        ...prev,
        ...res.data.user,
        profileImage: res.data.profileImage || res.data.user?.profileImage,
      }));

      toast.success(`${file.name} uploaded successfully`);
      onSuccess?.(res.data, file);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to upload profile image");
      onError?.(error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-[var(--primary)] font-mono uppercase tracking-widest text-xs">
        ◈ Fetching profile diagnostics...
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      <div className="flex min-h-screen bg-black text-gray-200 overflow-hidden font-mono relative">
        {/* Decorative ambient backgrounds */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.015)] rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

        <UserSidebar
          user={userData}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          navigate={navigate}
        />

        <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
          
          {/* Header section */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-gray-900 pb-6"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[var(--primary)] uppercase mb-1">
                <span>◈ Settings Terminal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                Manage Credentials
              </h1>
              <p className="text-gray-400 text-xs mt-1 font-semibold">
                Update your public profile configuration and professional telemetry
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#07070a] border border-gray-900 p-2 px-4 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-black border border-[rgba(250,204,21,0.15)] flex items-center justify-center text-sm text-[var(--primary)]">
                <UserOutlined />
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-black text-white tracking-wide uppercase">{userData.fullname}</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{userData.role} Account</div>
              </div>
            </div>
          </motion.header>

          {/* Main profile edit form card */}
          <div className="max-w-3xl mx-auto relative rounded-3xl p-6 md:p-8 bg-[#07070a]/95 border border-[rgba(250,204,21,0.15)] overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.02)]">
            
            {/* Tech decorative corners */}
            <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--primary)] opacity-40"></div>
            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--primary)] opacity-40"></div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-6 border-b border-gray-950">
              <div className="relative group">
                <motion.img
                  src={userData.profileImage || "/default-avatar.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border border-[rgba(250,204,21,0.2)] bg-black object-cover p-1 shadow-lg"
                  whileHover={{ scale: 1.03 }}
                />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--primary)] opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                  {userData.fullname}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-amber-300/80 bg-black/60 border border-[rgba(250,204,21,0.15)] px-2 py-0.5 rounded uppercase tracking-wider">
                    {userData.role}
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                    ID: {userData._id}
                  </span>
                </div>
              </div>

              {/* Upload custom avatar UI */}
              <div className="mt-4 sm:mt-0">
                <Upload
                  customRequest={handleUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    loading={uploadingImage}
                    icon={<UploadOutlined />}
                    className="!bg-black hover:!bg-[#07070a] !text-gray-300 hover:!text-[var(--primary)] !border-gray-900 hover:!border-[var(--primary)] !rounded-xl text-xs font-black uppercase tracking-widest py-5 flex items-center transition-all duration-300"
                  >
                    {uploadingImage ? "Uploading..." : "Upload Avatar"}
                  </Button>
                </Upload>
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="grid gap-2">
              <EditableField
                label="Full Display Name"
                name="fullname"
                value={userData.fullname}
                editField={editField}
                setEditField={setEditField}
                onSave={updateField}
                component={<Input />}
              />

              <EditableField
                label="Years of Industry Experience"
                name="experience"
                value={userData.experience}
                editField={editField}
                setEditField={setEditField}
                onSave={updateField}
                component={<Input />}
              />

              <EditableField
                label="Academic Education / Institution"
                name="education"
                value={userData.education}
                editField={editField}
                setEditField={setEditField}
                onSave={updateField}
                component={<Input />}
              />

              <EditableField
                label="Professional Skills Matrix"
                name="skills"
                value={userData.skills || []}
                editField={editField}
                setEditField={setEditField}
                onSave={updateField}
                component={
                  <Select
                    mode="tags"
                    placeholder="Select or enter skills"
                    value={userData.skills || []}
                    onChange={(value) =>
                      setUserData((prev) => ({
                        ...prev,
                        skills: value,
                      }))
                    }
                    className="!bg-black !border-gray-900 !text-white !rounded-xl w-full"
                  >
                    {allSkills.map((skill) => (
                      <Option key={skill} value={skill}>
                        {skill}
                      </Option>
                    ))}
                  </Select>
                }
              />

              <EditableField
                label="Professional Biography / About"
                name="description"
                value={userData.description}
                editField={editField}
                setEditField={setEditField}
                onSave={updateField}
                component={<TextArea rows={4} />}
              />
            </div>

            {/* Submit Control Action */}
            <div className="mt-8 pt-6 border-t border-gray-950">
              <button
                onClick={() => updateField({})}
                className="w-full py-3.5 text-xs font-black uppercase tracking-widest bg-[var(--primary)] text-black hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.25)] rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ThunderboltOutlined /> Commit Config Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileManager;
