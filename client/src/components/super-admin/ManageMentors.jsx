import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Avatar,
  Tag,
  Switch,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Divider,
  Space,
  List,
} from "antd";
import { UserOutlined, EditOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ManageMentors = () => {
  const API = "http://localhost:4000";

  const [mentorList, setMentorList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [menteesModalOpen, setMenteesModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorDetailsMap, setMentorDetailsMap] = useState({}); // mentorId -> details doc

  const [form] = Form.useForm();

  // ---------------- FETCH ----------------
  const fetchMentors = async () => {
    const res = await axios.get(`${API}/auth/mentors`, {
      withCredentials: true,
    });
    setMentorList(res.data.mentors || []);
  };

  const fetchMentorDetails = async () => {
    const res = await axios.get(`${API}/mentor-details`, {
      withCredentials: true,
    });
    const map = {};
    res.data?.forEach((doc) => {
      map[doc.mentorId] = doc;
    });
    setMentorDetailsMap(map);
  };

  useEffect(() => {
    fetchMentors();
    fetchMentorDetails();
  }, []);

  // ---------------- EDIT MODAL ----------------
  const openEditModal = (mentor) => {
    const details = mentorDetailsMap[mentor._id] || null;

    setSelectedMentor(mentor);
    setEditModalOpen(true);

    form.setFieldsValue({
      bio: details?.bio || "",
      features: details?.features || [],
      specializations: details?.specializations || [],
      maximumNoOfMentees: details?.maximumNoOfMentees || 10,
      isAvailable: details?.isAvailable ?? true,
      status: details?.status || "active",
      meetingLinks: details?.meetingLinks || [],
      linkedin: details?.socialLinks?.linkedin || "",
      github: details?.socialLinks?.github || "",
      website: details?.socialLinks?.website || "",
      plans: details?.plans || [],
    });
  };

  const handleUpdateMentor = async (values) => {
    try {
      setLoading(true);

      const payload = {
        mentorId: selectedMentor._id,
        ...values,
        socialLinks: {
          linkedin: values.linkedin,
          github: values.github,
          website: values.website,
        },
      };

      delete payload.linkedin;
      delete payload.github;
      delete payload.website;

      const existingDetails = mentorDetailsMap[selectedMentor._id];

      if (!existingDetails) {
        // FIRST TIME → POST
        await axios.post(`${API}/mentor-details`, payload, {
          withCredentials: true,
        });
      } else {
        // UPDATE → PUT
        await axios.put(
          `${API}/mentor-details/${existingDetails._id}`,
          payload,
          { withCredentials: true }
        );
      }

      setEditModalOpen(false);
      fetchMentorDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- MENTEES MODAL ----------------
  const openMenteesModal = (mentor) => {
    setSelectedMentor(mentor);
    setMenteesModalOpen(true);
  };

  // ---------------- TOGGLE ACTIVE ----------------
  const toggleActive = async (mentor) => {
    await axios.patch(
      `${API}/auth/mentors/${mentor._id}/toggle`,
      {},
      { withCredentials: true }
    );
    fetchMentors();
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono p-6">
      <Title level={2} className="!mb-6 !text-black">
        👨‍🏫 Mentor Manager
      </Title>

      <Row gutter={[16, 16]}>
        {mentorList.map((mentor) => {
          const details = mentorDetailsMap[mentor._id];
          return (
            <Col xs={24} sm={12} md={8} key={mentor._id}>
              <Card
                hoverable
                className="!border-black !rounded-none !shadow-none"
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      size={48}
                      src={mentor.profileImage || null}
                      icon={<UserOutlined />}
                    />
                  }
                  title={
                    <div className="flex flex-col gap-0">
                      <span className="font-semibold tracking-wide">
                        {mentor.fullname}
                      </span>
                      <span className="text-xs text-gray-500">
                        {mentor.email}
                      </span>
                    </div>
                  }
                />

                <Divider className="!my-3" />

                <div className="flex items-center justify-between">
                  <Tag
                    bordered
                    color="default"
                    className="!border-black !text-black !rounded-none"
                  >
                    {mentor.active ? "ACTIVE" : "INACTIVE"}
                  </Tag>

                  <Switch
                    checked={mentor.active}
                    onChange={() => toggleActive(mentor)}
                  />
                </div>

                <div className="mt-2 text-sm">
                  <Text strong>Role:</Text> {mentor.role}
                </div>

                {details && (
                  <div className="mt-2 text-xs text-gray-500">
                    <Text strong>Capacity:</Text>{" "}
                    {details.noOfMentees}/{details.maximumNoOfMentees}
                  </div>
                )}

                <Divider className="!my-3" />

                <Space className="w-full justify-between">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(mentor)}
                    className="!border-black !rounded-none"
                  >
                    {details ? "Edit Details" : "Add Details"}
                  </Button>

                  <Button
                    icon={<TeamOutlined />}
                    onClick={() => openMenteesModal(mentor)}
                    className="!border-black !rounded-none"
                  >
                    Manage Mentees
                  </Button>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ================= EDIT DETAILS MODAL ================= */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save Changes"
        confirmLoading={loading}
        width={900}
        className="font-mono"
        okButtonProps={{
          className: "!bg-black !text-white !border-black !rounded-none",
        }}
        cancelButtonProps={{
          className: "!border-black !rounded-none",
        }}
        title="Edit Mentor Details"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleUpdateMentor}
          className="font-mono"
        >
          <Divider orientation="left">Profile</Divider>

          <Form.Item label="Bio" name="bio">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Specializations" name="specializations">
                <Select mode="tags" placeholder="Add skills / domains" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Features" name="features">
                <Select mode="tags" placeholder="Add mentor features" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Capacity & Status</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Maximum No. of Mentees"
                name="maximumNoOfMentees"
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Availability"
                name="isAvailable"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Status" name="status">
                <Select
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "on-leave", label: "On Leave" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Meeting Links</Divider>

          <Form.Item name="meetingLinks">
            <Select mode="tags" placeholder="https://meet.google.com/..." />
          </Form.Item>

          <Divider orientation="left">Social Links</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="LinkedIn" name="linkedin">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="GitHub" name="github">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Website" name="website">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Plans</Divider>

          <Form.List name="plans">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    size="small"
                    className="!mb-4 !border-black !rounded-none"
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          label="Title"
                          name={[name, "title"]}
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="Price" name={[name, "price"]}>
                          <InputNumber min={0} className="w-full" />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item
                          label="Duration (days)"
                          name={[name, "duration"]}
                        >
                          <InputNumber min={1} className="w-full" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          label="What Can Do"
                          name={[name, "whatCanDo"]}
                        >
                          <Select mode="tags" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="What Cannot Do"
                          name={[name, "whatCannotDo"]}
                        >
                          <Select mode="tags" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      danger
                      type="text"
                      onClick={() => remove(name)}
                      className="!p-0"
                    >
                      Remove Plan
                    </Button>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      title: "",
                      price: 0,
                      duration: 30,
                      whatCanDo: [],
                      whatCannotDo: [],
                    })
                  }
                  className="w-full !border-black !rounded-none"
                >
                  + Add Plan
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ================= MANAGE MENTEES MODAL ================= */}
      <Modal
        open={menteesModalOpen}
        onCancel={() => setMenteesModalOpen(false)}
        footer={null}
        width={700}
        className="font-mono"
        title="Manage Mentees"
      >
        <div className="text-sm mb-3">
          <Text strong>Mentor:</Text> {selectedMentor?.fullname}
        </div>

        <Divider />

        <List
          bordered
          dataSource={mentorDetailsMap[selectedMentor?._id]?.mentees || []}
          locale={{ emptyText: "No mentees assigned yet." }}
          renderItem={(mentee) => (
            <List.Item className="!border-black">
              <div className="flex items-center justify-between w-full">
                <span>{mentee?.fullname || mentee}</span>
                <Button
                  danger
                  size="small"
                  className="!border-black !rounded-none"
                >
                  Remove
                </Button>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <Button block className="!border-black !rounded-none">
          + Assign New Mentee
        </Button>
      </Modal>
    </div>
  );
};

export default ManageMentors;
