// AddCourse.jsx - Complete Frontend with All Model Fields
import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Select,
  Upload,
  Form,
  Card,
  Typography,
  Space,
  Collapse,
  message,
  Checkbox,
  InputNumber,
  Tag,
  Rate,
} from "antd";
import { PlusOutlined, UploadOutlined, DeleteOutlined, MinusCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const AddCourse = () => {
  const [form] = Form.useForm();
  const [modules, setModules] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [roadmapImage, setRoadmapImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // Dynamic array handlers
  const addTag = () => setTags([...tags, ""]);
  const removeTag = (index) => setTags(tags.filter((_, i) => i !== index));
  const updateTag = (index, value) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const addPrerequisite = () => setPrerequisites([...prerequisites, ""]);
  const removePrerequisite = (index) => setPrerequisites(prerequisites.filter((_, i) => i !== index));
  const updatePrerequisite = (index, value) => {
    const newPrereqs = [...prerequisites];
    newPrereqs[index] = value;
    setPrerequisites(newPrereqs);
  };

  const addOutcome = () => setOutcomes([...outcomes, ""]);
  const removeOutcome = (index) => setOutcomes(outcomes.filter((_, i) => i !== index));
  const updateOutcome = (index, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const addInstructor = () => setInstructors([...instructors, ""]);
  const removeInstructor = (index) => setInstructors(instructors.filter((_, i) => i !== index));
  const updateInstructor = (index, value) => {
    const newInstructors = [...instructors];
    newInstructors[index] = value;
    setInstructors(newInstructors);
  };

  const handleAddModule = () => {
    setModules((prev) => [...prev, { title: "", submodules: [] }]);
  };

  const handleRemoveModule = (mIndex) => {
    setModules((prev) => prev.filter((_, i) => i !== mIndex));
  };

  const handleAddSubModule = (mIndex) => {
    const updated = [...modules];
    updated[mIndex].submodules.push({
      title: "",
      description: "",
      video: null,
      pdf: null,
    });
    setModules(updated);
  };

  const handleRemoveSub = (mIndex, sIndex) => {
    const updated = [...modules];
    updated[mIndex].submodules = updated[mIndex].submodules.filter((_, i) => i !== sIndex);
    setModules(updated);
  };

  const handleModuleTitleChange = (i, value) => {
    const updated = [...modules];
    updated[i].title = value;
    setModules(updated);
  };

  const handleSubModuleChange = (mIndex, sIndex, field, value) => {
    const updated = [...modules];
    updated[mIndex].submodules[sIndex][field] = value;
    setModules(updated);
  };

  const handleVideoUpload = (mIndex, sIndex, file) => {
    const updated = [...modules];
    updated[mIndex].submodules[sIndex].video = file;
    setModules(updated);
    return false;
  };

  const handlePdfUpload = (mIndex, sIndex, file) => {
    const updated = [...modules];
    updated[mIndex].submodules[sIndex].pdf = file;
    setModules(updated);
    return false;
  };

  const submitHandler = async (values) => {
    try {
      const formData = new FormData();

      // Basic fields
      formData.append("title", values.title.toLowerCase());
      formData.append("description", values.description);
      formData.append("duration", values.duration);
      formData.append("difficultyLevel", values.difficultyLevel);
      formData.append("language", values.language);
      formData.append("courseType", values.courseType);
      formData.append("price", values.price || 0);
      formData.append("discountPrice", values.discountPrice || 0);
      formData.append("category", values.category);
      formData.append("status", values.status);
      formData.append("certificateAvailable", values.certificateAvailable);

      // Array fields
      formData.append("tags", JSON.stringify(tags.filter(tag => tag.trim())));
      formData.append("prerequisits", JSON.stringify(prerequisites.filter(prereq => prereq.trim())));
      formData.append("outCome", JSON.stringify(outcomes.filter(outcome => outcome.trim())));
      formData.append("instructor", JSON.stringify(instructors.filter(instr => instr.trim())));

      // Images
      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (roadmapImage) formData.append("roadmapImage", roadmapImage);

      // Modules with submodules (only metadata)
      formData.append("modules", JSON.stringify(modules.map(m => ({
        title: m.title,
        submodules: m.submodules.map(sub => ({
          title: sub.title,
          description: sub.description,
        })),
      }))));

      // Attach files separately
      modules.forEach((module, mIndex) => {
        module.submodules.forEach((sub, sIndex) => {
          if (sub.video) formData.append(`video_${mIndex}_${sIndex}`, sub.video);
          if (sub.pdf) formData.append(`pdf_${mIndex}_${sIndex}`, sub.pdf);
        });
      });

      const res = await axios.post("http://localhost:4000/course/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      message.success("Course created successfully!");
      form.resetFields();
      setModules([]);
      setTags([]);
      setPrerequisites([]);
      setOutcomes([]);
      setInstructors([]);
      console.log(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || "Error creating course");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-black text-white font-mono">
      <Card className="max-w-6xl mx-auto bg-neutral-900 text-white border border-white/10 shadow-lg">
        <Title level={2} className="text-center text-white font-mono mb-6">
          Add New Course
        </Title>

        <Form form={form} layout="vertical" onFinish={submitHandler}>
          {/* Basic Info */}
          <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Card title="Basic Information" size="small">
              <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
                <Form.Item name="title" label="Course Title" rules={[{ required: true, message: 'Required' }]}>
                  <Input className="bg-neutral-800 text-white" placeholder="Full Stack Development" />
                </Form.Item>

                <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Required' }]}>
                  <Input.TextArea rows={4} className="bg-neutral-800 text-white" />
                </Form.Item>

                <Form.Item name="duration" label="Duration" rules={[{ required: true, message: 'Required' }]}>
                  <Input className="bg-neutral-800 text-white" placeholder="40 hours" />
                </Form.Item>

                <Form.Item name="language" label="Language" initialValue="English">
                  <Select className="bg-neutral-800 text-white">
                    <Option value="English">English</Option>
                    <Option value="Hindi">Hindi</Option>
                    <Option value="Spanish">Spanish</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="difficultyLevel" label="Difficulty Level" rules={[{ required: true }]}>
                  <Select className="bg-neutral-800 text-white">
                    <Option value="beginner">Beginner</Option>
                    <Option value="intermediate">Intermediate</Option>
                    <Option value="advanced">Advanced</Option>
                  </Select>
                </Form.Item>
              </Space>
            </Card>

            {/* Pricing & Type */}
            <Card title="Pricing & Access" size="small">
              <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
                <Form.Item name="courseType" label="Course Type" initialValue="free">
                  <Select className="bg-neutral-800 text-white">
                    <Option value="free">Free</Option>
                    <Option value="premium">Premium</Option>
                  </Select>
                </Form.Item>

                <Space>
                  <Form.Item name="price" label="Price">
                    <InputNumber className="bg-neutral-800 text-white" min={0} precision={2} />
                  </Form.Item>
                  <Form.Item name="discountPrice" label="Discount Price">
                    <InputNumber className="bg-neutral-800 text-white" min={0} precision={2} />
                  </Form.Item>
                </Space>

                <Form.Item name="category" label="Category" initialValue="general">
                  <Select className="bg-neutral-800 text-white">
                    <Option value="general">General</Option>
                    <Option value="web-development">Web Development</Option>
                    <Option value="data-science">Data Science</Option>
                    <Option value="mobile-app">Mobile App</Option>
                  </Select>
                </Form.Item>
              </Space>
            </Card>

            {/* Images */}
            <Card title="Course Images" size="small">
              <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
                <Form.Item label="Thumbnail">
                  <Upload beforeUpload={(file) => { setThumbnail(file); return false; }} listType="picture">
                    <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
                  </Upload>
                </Form.Item>

                <Form.Item label="Roadmap Image">
                  <Upload beforeUpload={(file) => { setRoadmapImage(file); return false; }} listType="picture">
                    <Button icon={<UploadOutlined />}>Upload Roadmap</Button>
                  </Upload>
                </Form.Item>
              </Space>
            </Card>

            {/* Tags & Lists */}
            <Card title="Tags & Requirements" size="small">
              <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
                <div>
                  <Text strong>Tags</Text>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addTag} size="small" className="ml-2">
                    Add Tag
                  </Button>
                  <div className="mt-2">
                    {tags.map((tag, index) => (
                      <Space key={index} className="mb-1">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          className="bg-neutral-800 text-white w-32"
                          suffix={<DeleteOutlined onClick={() => removeTag(index)} className="text-red-500 cursor-pointer" />}
                        />
                      </Space>
                    ))}
                  </div>
                </div>

                <div>
                  <Text strong>Prerequisites</Text>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addPrerequisite} size="small" className="ml-2">
                    Add Prerequisite
                  </Button>
                  <div className="mt-2 space-y-1">
                    {prerequisites.map((prereq, index) => (
                      <Input
                        key={index}
                        value={prereq}
                        onChange={(e) => updatePrerequisite(index, e.target.value)}
                        className="bg-neutral-800 text-white"
                        suffix={<DeleteOutlined onClick={() => removePrerequisite(index)} className="text-red-500 cursor-pointer" />}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Text strong>Learning Outcomes</Text>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addOutcome} size="small" className="ml-2">
                    Add Outcome
                  </Button>
                  <div className="mt-2 space-y-1">
                    {outcomes.map((outcome, index) => (
                      <Input
                        key={index}
                        value={outcome}
                        onChange={(e) => updateOutcome(index, e.target.value)}
                        className="bg-neutral-800 text-white"
                        suffix={<DeleteOutlined onClick={() => removeOutcome(index)} className="text-red-500 cursor-pointer" />}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Text strong>Instructors</Text>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addInstructor} size="small" className="ml-2">
                    Add Instructor
                  </Button>
                  <div className="mt-2 space-y-1">
                    {instructors.map((instructor, index) => (
                      <Input
                        key={index}
                        value={instructor}
                        onChange={(e) => updateInstructor(index, e.target.value)}
                        className="bg-neutral-800 text-white"
                        placeholder="Instructor name or email"
                        suffix={<DeleteOutlined onClick={() => removeInstructor(index)} className="text-red-500 cursor-pointer" />}
                      />
                    ))}
                  </div>
                </div>
              </Space>
            </Card>

            {/* Status & Publishing */}
            <Card title="Publishing Settings" size="small">
              <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
                <Form.Item name="status" label="Status" initialValue="draft">
                  <Select className="bg-neutral-800 text-white">
                    <Option value="draft">Draft</Option>
                    <Option value="pending">Pending Review</Option>
                    <Option value="published">Published</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="certificateAvailable" valuePropName="checked" initialValue={false}>
                  <Checkbox>Certificate Available</Checkbox>
                </Form.Item>
              </Space>
            </Card>

            {/* Dynamic Modules */}
            <Card title="Course Modules" size="small">
              <div className="mb-4">
                <Text className="text-lg font-bold">Modules</Text>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddModule}
                  className="ml-3"
                >
                  Add Module
                </Button>
              </div>

              <Collapse className="bg-neutral-800" ghost>
                {modules.map((module, mIndex) => (
                  <Panel
                    header={`Module ${mIndex + 1}: ${module.title || 'Untitled'}`}
                    key={mIndex}
                    extra={
                      <DeleteOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveModule(mIndex);
                        }}
                        className="text-red-500 cursor-pointer"
                      />
                    }
                  >
                    <Input
                      placeholder="Module Title"
                      className="bg-neutral-700 text-white mb-3 w-full"
                      value={module.title}
                      onChange={(e) => handleModuleTitleChange(mIndex, e.target.value)}
                    />

                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddSubModule(mIndex)}
                      className="mb-3"
                    >
                      Add Submodule
                    </Button>

                    {module.submodules.map((sub, sIndex) => (
                      <Space direction="vertical" className="w-full mb-4 p-3 border rounded bg-neutral-950" key={sIndex}>
                        <div className="flex justify-between items-center mb-2">
                          <Text className="font-semibold">Submodule {sIndex + 1}</Text>
                          <DeleteOutlined
                            onClick={() => handleRemoveSub(mIndex, sIndex)}
                            className="text-red-400 cursor-pointer text-lg"
                          />
                        </div>

                        <Input
                          className="bg-neutral-700 text-white"
                          placeholder="Submodule Title"
                          value={sub.title}
                          onChange={(e) => handleSubModuleChange(mIndex, sIndex, "title", e.target.value)}
                        />

                        <Input.TextArea
                          rows={2}
                          className="bg-neutral-700 text-white"
                          placeholder="Submodule Description"
                          value={sub.description}
                          onChange={(e) => handleSubModuleChange(mIndex, sIndex, "description", e.target.value)}
                        />

                        <Space>
                          <Upload beforeUpload={(file) => handleVideoUpload(mIndex, sIndex, file)}>
                            <Button icon={<UploadOutlined />}>Upload Video</Button>
                          </Upload>
                          <Upload beforeUpload={(file) => handlePdfUpload(mIndex, sIndex, file)}>
                            <Button icon={<UploadOutlined />}>Upload PDF</Button>
                          </Upload>
                        </Space>
                      </Space>
                    ))}
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Space>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            className="mt-8 bg-blue-600 hover:bg-blue-700"
          >
            Create Course
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddCourse;
