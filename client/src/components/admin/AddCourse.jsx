"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  Input,
  Button,
  Upload,
  Table,
  Switch,
  Tooltip,
  Skeleton,
  Card,
  Steps,
  Collapse,
  Row,
  Col,
  Progress,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  LoadingOutlined,
  CodeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Context from "../../util/context";
import AdminSidebar from "./AdminSidebar";

const { Panel } = Collapse;

export default function AddCourse() {
  const { session, sessionLoading } = useContext(Context);
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");

  const [course, setCourse] = useState({
    title: "",
    description: "",
    duration: "",
    difficultyLevel: "beginner",
    instructor: [],
  });

  const [modules, setModules] = useState([
    { title: "", submodules: [{ title: "", description: "", video: null, pdf: null, tutorial: "" }] },
  ]);

  const [demoCourses, setDemoCourses] = useState([
    { key: 1, title: "React Basics", duration: "4 weeks", difficultyLevel: "Beginner", progress: 75 },
    { key: 2, title: "Advanced Node.js", duration: "6 weeks", difficultyLevel: "Intermediate", progress: 45 },
  ]);

  // Protect admin route
  useEffect(() => {
    if (!sessionLoading) {
      if (!session) return navigate("/login");
      if (session.role !== "admin") {
        toast.error("Admins only!");
        return navigate("/");
      }
    }
  }, [session, sessionLoading]);

  const addModule = () => {
    setModules([...modules, { title: "", submodules: [{ title: "", description: "", video: null, pdf: null, tutorial: "" }] }]);
  };

  const addSubModule = (moduleIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].submodules.push({ title: "", description: "", video: null, pdf: null, tutorial: "" });
    setModules(newModules);
  };

  const updateField = (mi, si, key, value) => {
    const temp = [...modules];
    if (si === null) temp[mi][key] = value;
    else temp[mi].submodules[si][key] = value;
    setModules(temp);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", course.title);
      formData.append("description", course.description);
      formData.append("duration", course.duration);
      formData.append("difficultyLevel", course.difficultyLevel);
      formData.append("modules", JSON.stringify(modules));

      modules.forEach((m, mi) =>
        m.submodules.forEach((s, si) => {
          if (s.video) formData.append(`files_${mi}_${si}_video`, s.video);
          if (s.pdf) formData.append(`files_${mi}_${si}_pdf`, s.pdf);
        })
      );

      await axios.post("http://localhost:4000/course/create", formData, { withCredentials: true });

      toast.success("✅ Course created successfully!");
      setDemoCourses([
        ...demoCourses,
        { key: demoCourses.length + 1, title: course.title, duration: course.duration, difficultyLevel: course.difficultyLevel, progress: 0 },
      ]);
      setCourse({ title: "", description: "", duration: "", difficultyLevel: "beginner", instructor: [] });
      setModules([{ title: "", submodules: [{ title: "", description: "", video: null, pdf: null, tutorial: "" }] }]);
      setCurrentStep(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = demoCourses.filter((c) =>
    c.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => (
        <div className="flex items-center gap-3">
          <div className="bg-black w-3 h-3 rounded-full" />
          <span className="text-black font-mono font-medium">{text}</span>
        </div>
      )
    },
    { title: "Duration", dataIndex: "duration", key: "duration", render: (text) => <span className="font-mono">{text}</span> },
    {
      title: "Level",
      dataIndex: "difficultyLevel",
      key: "difficultyLevel",
      render: (text) => <span className="font-mono font-semibold px-2 py-1 rounded-full text-xs w-24 text-center block bg-gray-100">{text}</span>
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div className="w-24">
          <Progress percent={record.progress} size="small" showInfo={false}
            strokeColor="#000"
            className="!font-mono" />
        </div>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            className="!font-mono !text-xs !px-3 !py-1.5 !rounded-lg !shadow-md hover:!shadow-lg !border-none transition-all duration-200 !bg-black !text-white hover:!bg-gray-800"
            size="small"
            icon={<CodeOutlined />}
          >
            Code
          </Button>
          <Button
            className="!font-mono !text-xs !px-3 !py-1.5 !rounded-lg !shadow-md hover:!shadow-lg !border-none transition-all duration-200 !bg-black !text-white hover:!bg-gray-800"
            size="small"
            icon={<PlayCircleOutlined />}
          >
            Play
          </Button>
        </div>
      ),
    },
  ];

  const steps = [
    { title: '01 BASIC', description: 'Course details' },
    { title: '02 MODULES', description: 'Structure content' },
    { title: '03 PUBLISH', description: 'Review & create' }
  ];

  if (sessionLoading || !session)
    return (
      <div className="bg-white p-10 min-h-screen">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );

  return (
    <div className="flex min-h-screen font-mono bg-white text-black">
      <AdminSidebar session={session} open={collapsed} setOpen={setCollapsed} darkMode={false} />
      
      <div className="flex-1 p-4 lg:p-8 xl:p-12 overflow-y-auto">
        <ToastContainer theme="light" position="top-right" />

        {/* Header & Search */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="p-6 lg:p-8 rounded-2xl border-2 bg-gray-50 border-black/10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-black w-2 h-2 rounded-full animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider opacity-75">admin@course-builder</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black font-mono tracking-tight leading-tight">
                  COURSE BUILDER
                </h1>
                <p className="text-lg font-mono opacity-80 mt-2">v2.0.1 | Build → Deploy → Scale</p>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex-1 lg:w-80">
                  <Input
                    placeholder="> Search courses..."
                    prefix={<SearchOutlined className="text-sm" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="!h-12 !rounded-xl !px-5 !py-3 !shadow-xl !border-none !font-mono !text-sm tracking-wide !backdrop-blur-sm !bg-white/90 !text-black placeholder-gray-400 hover:!bg-white !border-black/20 shadow-2xl"
                  />
                </div>
                
                <Button 
                  className="!h-12 !px-6 !rounded-xl !font-mono !font-bold !shadow-xl !border-none !backdrop-blur-sm transition-all duration-300 hover:!shadow-2xl !text-sm tracking-wide !bg-black !text-white hover:!bg-gray-900"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? "EXIT" : "BUILD"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <Card 
          className="!mb-8 !rounded-2xl !shadow-2xl !border-none !p-4 !backdrop-blur-xl"
          style={{ 
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(0,0,0,0.08)"
          }}
        >
          <Steps 
            current={currentStep}
            items={steps.map((step, index) => ({
              title: <span className="font-mono font-bold text-sm uppercase tracking-wide">{step.title}</span>,
              description: <span className="font-mono text-xs opacity-70">{step.description}</span>,
              icon: (
                <div className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg font-mono font-bold text-sm">
                  {index + 1}
                </div>
              )
            }))}
            className="!w-full !font-mono"
            size="small"
          />
        </Card>

        {/* Main Builder Terminal */}
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card 
                className="!rounded-3xl !shadow-3xl !border-none !p-2 lg:!p-6 !mb-10 !max-w-7xl mx-auto"
                style={{ 
                  background: "rgba(248,250,252,0.95)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  backdropFilter: "blur(20px)"
                }}
              >
                {/* Tabs */}
                <div className="flex bg-black/10 backdrop-blur-sm rounded-t-2xl p-1 mb-6">
                  {["basic", "modules"].map((tab) => (
                    <Button
                      key={tab}
                      className={`!font-mono !font-bold !text-sm !rounded-xl !flex-1 !py-3 !mx-1 transition-all duration-300 !shadow-md ${
                        activeTab === tab
                          ? "!bg-black !text-white shadow-xl !shadow-black/20"
                          : "!bg-transparent !text-gray-400 hover:!bg-black/20 !border !border-black/10"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "basic" ? "01 BASIC INFO" : "02 MODULES"}
                    </Button>
                  ))}
                </div>

                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="flex items-center gap-4 mb-8 p-4 bg-black/5 rounded-2xl">
                      <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xl shadow-xl">
                        01
                      </div>
                      <div>
                        <h2 className="text-2xl font-black font-mono tracking-tight">BASIC INFORMATION</h2>
                        <p className="font-mono text-sm opacity-70">Course metadata & configuration</p>
                      </div>
                    </div>

                    <Row gutter={24}>
                      <Col xs={24} lg={8}>
                        <div className="space-y-3">
                          <label className="font-mono text-sm font-semibold opacity-90 block mb-2">COURSE TITLE</label>
                          <Input
                            placeholder="Enter course title..."
                            className="!h-16 !rounded-2xl !px-6 !py-4 !shadow-2xl !border-none !font-mono !font-semibold text-lg tracking-wide focus:!ring-4 focus:!ring-black/20 !backdrop-blur-sm !bg-white !text-black placeholder-gray-400 hover:!bg-gray-50 shadow-3xl"
                            value={course.title}
                            onChange={(e) => setCourse({ ...course, title: e.target.value })}
                          />
                        </div>
                      </Col>
                      <Col xs={24} lg={8}>
                        <div className="space-y-3">
                          <label className="font-mono text-sm font-semibold opacity-90 block mb-2">DURATION</label>
                          <Input
                            placeholder="6 weeks"
                            className="!h-16 !rounded-2xl !px-6 !py-4 !shadow-2xl !border-none !font-mono !font-semibold tracking-wide focus:!ring-4 focus:!ring-black/20 !backdrop-blur-sm !bg-white !text-black placeholder-gray-400 hover:!bg-gray-50 shadow-3xl"
                            value={course.duration}
                            onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                          />
                        </div>
                      </Col>
                      <Col xs={24} lg={8}>
                        <div className="space-y-3">
                          <label className="font-mono text-sm font-semibold opacity-90 block mb-2">DIFFICULTY</label>
                          <select
                            value={course.difficultyLevel}
                            onChange={(e) => setCourse({ ...course, difficultyLevel: e.target.value })}
                            className="w-full !h-16 !rounded-2xl !px-6 !py-4 !shadow-2xl !border-none !font-mono !font-bold text-lg tracking-wide focus:!ring-4 focus:!ring-black/20 !backdrop-blur-sm appearance-none cursor-pointer !bg-white !text-black hover:!bg-gray-50 shadow-3xl"
                          >
                            <option value="beginner">▰▱▱▱▱ BEGINNER</option>
                            <option value="intermediate">▱▰▱▱▱ INTERMEDIATE</option>
                            <option value="advanced">▱▱▰▱▱ ADVANCED</option>
                            <option value="expert">▱▱▱▰▱ EXPERT</option>
                          </select>
                        </div>
                      </Col>
                    </Row>

                    <div className="space-y-3">
                      <label className="font-mono text-sm font-semibold opacity-90 block mb-4">DESCRIPTION</label>
                      <Input.TextArea
                        rows={5}
                        placeholder="Write a comprehensive course description..."
                        className="!rounded-3xl !px-6 !py-5 !shadow-3xl !border-none !font-mono !font-medium text-lg leading-relaxed tracking-wide focus:!ring-4 focus:!ring-black/20 !backdrop-blur-sm resize-vertical !bg-white !text-black placeholder-gray-400 hover:!bg-gray-50"
                        value={course.description}
                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Modules Tab */}
                {activeTab === "modules" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-black/5 rounded-2xl">
                      <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xl shadow-xl">
                        02
                      </div>
                      <div>
                        <h2 className="text-2xl font-black font-mono tracking-tight">MODULE STRUCTURE</h2>
                        <p className="font-mono text-sm opacity-70">Organize content hierarchically</p>
                      </div>
                    </div>

                    <Collapse 
                      accordion 
                      ghost
                      className="!bg-transparent !font-mono"
                      expandIconPosition="end"
                    >
                      {modules.map((module, mi) => (
                        <Panel 
                          key={mi}
                          header={
                            <div className="flex items-center gap-4 w-full">
                              <div className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-lg">
                                M{mi + 1}
                              </div>
                              <Input
                                placeholder={`Module ${mi + 1}`}
                                className="!border-none !bg-transparent !p-0 !text-xl !font-mono !font-black flex-1 !text-black"
                                value={module.title}
                                onChange={(e) => updateField(mi, null, "title", e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          }
                          className="!rounded-2xl !mt-2 !mb-3 !shadow-2xl !font-mono !backdrop-blur-md transition-all duration-300 !bg-white/90 hover:!shadow-3xl !border-black/5"
                        >
                          <div className="p-6 space-y-6">
                            {module.submodules.map((sub, si) => (
                              <motion.div 
                                key={si}
                                className="!bg-white/60 !p-6 !rounded-xl !border !border-black/10 shadow-xl"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: si * 0.1 }}
                              >
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg shadow-xl flex-shrink-0">
                                    {si + 1}
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-3">
                                    <Input
                                      placeholder="Submodule Title"
                                      className="!h-14 !rounded-xl !px-5 !py-3 !shadow-xl !border-none !font-mono !font-semibold text-base tracking-wide focus:!ring-4 focus:!ring-black/20 !backdrop-blur-sm !bg-white !text-black placeholder-gray-400 hover:!bg-gray-50 shadow-2xl"
                                      value={sub.title}
                                      onChange={(e) => updateField(mi, si, "title", e.target.value)}
                                    />
                                    <Input
                                      placeholder="Description"
                                      className="!h-12 !rounded-xl !px-5 !py-2 !shadow-lg !border-none !font-mono text-sm tracking-wide focus:!ring-4 focus:!ring-black/20 !backdrop-blur-sm !bg-white/80 !text-black placeholder-gray-400 hover:!bg-gray-50"
                                      value={sub.description}
                                      onChange={(e) => updateField(mi, si, "description", e.target.value)}
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Upload
                                    beforeUpload={(file) => {
                                      updateField(mi, si, "video", file);
                                      return false;
                                    }}
                                  >
                                    <motion.div 
                                      className="!h-20 !rounded-xl !flex !items-center !justify-center !cursor-pointer !shadow-xl !border-2 !border-dashed !font-mono !font-semibold text-sm tracking-wide transition-all duration-300 hover:!scale-105 hover:!shadow-2xl hover:!border-black/50 !bg-white !text-black !border-black/10 hover:!bg-black/5"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <UploadOutlined className="text-xl mr-2" />
                                      VIDEO
                                    </motion.div>
                                  </Upload>
                                  <Upload
                                    beforeUpload={(file) => {
                                      updateField(mi, si, "pdf", file);
                                      return false;
                                    }}
                                  >
                                    <motion.div 
                                      className="!h-20 !rounded-xl !flex !items-center !justify-center !cursor-pointer !shadow-xl !border-2 !border-dashed !font-mono !font-semibold text-sm tracking-wide transition-all duration-300 hover:!scale-105 hover:!shadow-2xl hover:!border-black/50 !bg-white !text-black !border-black/10 hover:!bg-black/5"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <UploadOutlined className="text-xl mr-2" />
                                      PDF
                                    </motion.div>
                                  </Upload>
                                </div>
                              </motion.div>
                            ))}
                            
                            <Button 
                              className="!w-full !h-14 !rounded-xl !font-mono !font-bold !text-base !shadow-2xl !border-none transition-all duration-300 hover:!scale-105 hover:!shadow-3xl tracking-wide !bg-black !text-white hover:!bg-gray-900"
                              icon={<PlusOutlined />}
                              onClick={() => addSubModule(mi)}
                            >
                              ➕ ADD SUBMODULE
                            </Button>
                          </div>
                        </Panel>
                      ))}
                    </Collapse>

                    <Button 
                      className="!w-full !h-16 !rounded-2xl !font-mono !font-black !text-xl !shadow-3xl !border-none transition-all duration-500 hover:!scale-105 hover:!shadow-4xl tracking-wider !bg-black !text-white hover:!bg-gray-900"
                      icon={<PlusOutlined className="text-2xl" />}
                      onClick={addModule}
                    >
                      📚 NEW MODULE
                    </Button>
                  </motion.div>
                )}
              </Card>

              {/* Submit Button */}
              <motion.div 
                className="p-8 rounded-3xl mt-8 text-center bg-white/50 border border-black/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  block
                  size="large"
                  loading={loading}
                  onClick={handleSubmit}
                  className="!h-20 !rounded-3xl !text-3xl !font-mono !font-black !shadow-4xl !border-none transition-all duration-500 hover:!scale-105 hover:!shadow-5xl !tracking-widest !uppercase !backdrop-blur-xl !bg-black !text-white hover:!bg-gray-900 text-shadow-lg"
                >
                  {loading ? <LoadingOutlined spin className="mr-4 text-2xl" /> : '🚀 DEPLOY COURSE'}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Courses Terminal */}
        <Card
          className="!rounded-3xl !shadow-3xl !border-none !p-8 !backdrop-blur-xl"
          style={{ 
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(0,0,0,0.08)"
          }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-black w-2 h-2 rounded-full" />
                <span className="font-mono text-sm uppercase tracking-wider opacity-70">DEPLOYED COURSES</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black font-mono tracking-tight">
                COURSE DIRECTORY
              </h2>
            </div>
            <span className="px-6 py-3 !rounded-2xl !font-mono !font-bold !text-sm tracking-wide !shadow-xl !bg-black/10 !text-black !border !border-black/30">
              {filteredCourses.length} ACTIVE
            </span>
          </div>
          
          <div className="!rounded-2xl !overflow-hidden !shadow-3xl !backdrop-blur-xl !bg-white/90">
            <Table
              dataSource={filteredCourses}
              columns={columns}
                              

              pagination={{ 
                pageSize: 10,
                showSizeChanger: false,
              }}
        className="!bg-gray-50/70 !shadow-inner !font-mono !rounded-2xl"
              rowClassName={(record, index) => 
                index % 2 === 0 
                  ? "!bg-white/60 hover:!bg-black/5"
                  : "!bg-gray-50/50 hover:!bg-black/5"
              }
              locale={{
                emptyText: (
                  <div className="py-20 text-center">
                    <SearchOutlined className="text-6xl mx-auto mb-6 opacity-40 block font-mono" />
                    <span className="text-gray-400 !font-mono !text-lg !font-bold tracking-wide">
                      NO COURSES FOUND
                    </span>
                    <p className="text-gray-500 !font-mono !text-sm mt-2">
                      Start building your first course above ↑
                    </p>
                  </div>
                )
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
