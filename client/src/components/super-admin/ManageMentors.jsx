// Full React frontend for Mentor Management - FIXED
// Tech: React + Tailwind + Axios + AntD (unstyled via !)
// Theme: Black & White, mono font - Professional Dashboard Style

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Button, Modal, Input, Pagination, message, Tag, Card, Avatar, 
  Progress, Rate, Space, Typography, Divider, Badge, Popover, Spin,
  Input as AntInput
} from "antd";
import { 
  UserOutlined, StarFilled, PhoneOutlined, LinkOutlined, 
  CalendarOutlined, MessageOutlined, EditOutlined, 
  CheckCircleOutlined, ClockCircleOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

const API = "http://localhost:4000";

axios.defaults.baseURL = API;
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

export default function MentorManagement() {
  const [mentors, setMentors] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMentors = async (pageNo = 1, search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNo, limit: 8 });
      if (search) params.append("search", search);
      const res = await axios.get(`/auth/mentors?${params}`);
      setMentors(res.data.mentors || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Fetch mentors error:", err);
      message.error("Failed to load mentors");
      setMentors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors(page, searchTerm);
  }, [page, searchTerm]);

  // FIXED: Safe filtering with null checks
  const filteredMentors = mentors.filter(mentor => {
    if (!mentor || typeof mentor !== 'object') return false;
    const name = mentor.name || '';
    const email = mentor.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Safe stats calculations
  const activeMentorsCount = mentors.filter(m => 
    m && m.status === 'active'
  ).length;
  
  const availableMentorsCount = mentors.filter(m => 
    m && m.hasCapacity === true
  ).length;
  
  const avgRating = mentors.length > 0 
    ? Math.round(mentors.reduce((acc, m) => {
        const rating = m.averageRating || 0;
        return acc + rating;
      }, 0) / mentors.length * 10) / 10
    : 0;

  return (
    <div className="grid-bg min-h-screen bg-gradient-to-br from-gray-50 to-white text-black font-mono p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={1} className="text-4xl !text-white font-bold  mb-2">
              Mentor Dashboard
            </Title>
            <Text className="text-gray-600">Manage and monitor your mentorship programs</Text>
          </div>
          <AntInput.Search
            placeholder="Search mentors by name or email"
            className="!w-80 !border-black !rounded-lg !font-mono"
            onSearch={setSearchTerm}
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid bg-gray-900 grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Mentors" value={total} icon={<UserOutlined />}   className=""/>
          <StatsCard title="Active Mentors" value={activeMentorsCount} icon={<CheckCircleOutlined />} color="green" />
          <StatsCard title="Available Slots" value={availableMentorsCount} icon={<ClockCircleOutlined />} color="blue" />
          <StatsCard title="Avg Rating" value={avgRating} icon={<StarFilled />} color="yellow" />
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <UserOutlined className="text-6xl text-gray-300 mx-auto mb-4" />
              <Title level={3} className="text-gray-500">
                {searchTerm ? "No mentors match your search" : "No mentors found"}
              </Title>
            </div>
          ) : (
            filteredMentors.map((mentor) => (
              <MentorCard key={mentor._id || mentor.id} mentor={mentor} onEdit={() => {
                setSelectedMentor(mentor);
                setIsModalOpen(true);
              }} />
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 8 && (
          <div className="flex justify-center">
            <Pagination
              current={page}
              total={total}
              pageSize={8}
              onChange={(p) => setPage(p)}
              className="!font-mono !text-sm"
              showSizeChanger={false}
            />
          </div>
        )}

        <MentorDetailsModal
          open={isModalOpen}
          mentor={selectedMentor}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMentor(null);
          }}
          onSuccess={() => fetchMentors(page, searchTerm)}
        />
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color = "blue" }) {
  return (
    <Card className="border-black hover:shadow-xl transition-all duration-300 border hover:border-gray-800 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-2xl font-bold text-black">{value}</Text>
          <Text className="text-sm text-gray-600 block mt-1">{title}</Text>
        </div>
        <div className={`p-3 rounded-xl bg-${color === 'green' ? 'green' : color === 'yellow' ? 'yellow' : 'blue'}-100 text-${color === 'green' ? 'green' : color === 'yellow' ? 'yellow' : 'blue'}-600`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function MentorCard({ mentor, onEdit }) {
  // Safe property access
  const safeMentor = {
    name: mentor.name || 'Unknown Mentor',
    email: mentor.email || 'No email',
    bio: mentor.bio || '',
    status: mentor.status || 'active',
    averageRating: mentor.averageRating || 0,
    noOfMentees: mentor.noOfMentees || 0,
    maximumNoOfMentees: mentor.maximumNoOfMentees || 10,
    specializations: mentor.specializations || [],
    socialLinks: mentor.socialLinks || {},
    isAvailable: mentor.isAvailable !== false, // default true
    hasCapacity: mentor.hasCapacity !== false // default true
  };
  
  const capacityPercent = safeMentor.maximumNoOfMentees > 0 
    ? Math.round((safeMentor.noOfMentees / safeMentor.maximumNoOfMentees) * 100)
    : 0;
  
  return (
    <Card className="border-2 border-black hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-gray-900 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar size={64} icon={<UserOutlined />} className="border-4 border-black bg-black" />
          <div>
            <Title level={4} className="m-0 font-bold group-hover:text-gray-800 line-clamp-1">
              {safeMentor.name}
            </Title>
            <Text className="text-sm text-gray-600 block truncate max-w-[200px]">
              {safeMentor.email}
            </Text>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <Badge.Ribbon 
            text={safeMentor.status} 
            color={safeMentor.status === 'active' ? 'green' : safeMentor.status === 'on-leave' ? 'gold' : 'red'}
          />
          <Rate disabled value={safeMentor.averageRating} className="text-xs" allowHalf />
        </div>
      </div>

      {/* Bio Preview */}
      {safeMentor.bio && (
        <Text className="text-sm text-gray-700 mb-4 line-clamp-2 block">{safeMentor.bio}</Text>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {safeMentor.specializations.slice(0, 3).map((spec, i) => (
          <Tag key={i} className="!border-black !bg-gray-100 !text-black hover:!bg-black hover:!text-white transition-colors">
            {spec}
          </Tag>
        ))}
        {safeMentor.specializations.length > 3 && (
          <Popover content={
            safeMentor.specializations.slice(3).map((s, i) => (
              <div key={i} className="py-1">{s}</div>
            ))
          }>
            <Tag className="!border-black !bg-gray-100 !text-black">+{safeMentor.specializations.length - 3}</Tag>
          </Popover>
        )}
      </div>

      {/* Capacity & Stats */}
      <Divider className="my-4 border-black" />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Text className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
            <UserOutlined /> Capacity
          </Text>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Progress 
                percent={capacityPercent} 
                showInfo={false}
                strokeColor={capacityPercent > 80 ? "#ef4444" : capacityPercent > 50 ? "#f59e0b" : "#10b981"}
                trailColor="#e5e7eb"
                className="!h-2"
              />
            </div>
            <Text className="text-sm font-mono whitespace-nowrap">
              {safeMentor.noOfMentees}/{safeMentor.maximumNoOfMentees}
            </Text>
          </div>
        </div>
        <div>
          <Text className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
            <MessageOutlined /> Active Mentees
          </Text>
          <Text className="text-lg font-bold">{safeMentor.noOfMentees}</Text>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Button
          className="!bg-black !text-white !border-black hover:!bg-gray-900 flex-1 font-mono text-sm h-10 !rounded-lg"
          icon={<EditOutlined />}
          onClick={onEdit}
        >
          Edit Details
        </Button>
        <Button
          className="!bg-white !text-black !border-black hover:!bg-gray-50 flex-1 font-mono text-sm h-10 !rounded-lg"
          href={`/manage-mentees/${mentor._id || mentor.id}`}
        >
          Manage Mentees
        </Button>
      </div>

      {/* Social Links */}
      {Object.values(safeMentor.socialLinks).some(link => link) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <Popover 
            content={
              <Space direction="vertical" size="small">
                {safeMentor.socialLinks.linkedin && (
                  <a href={safeMentor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                    <LinkOutlined /> LinkedIn
                  </a>
                )}
                {safeMentor.socialLinks.github && (
                  <a href={safeMentor.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gray-800">
                    <LinkOutlined /> GitHub
                  </a>
                )}
                {safeMentor.socialLinks.website && (
                  <a href={safeMentor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                    <LinkOutlined /> Website
                  </a>
                )}
              </Space>
            }
          >
            <div className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-black">
              <LinkOutlined /> View Links
            </div>
          </Popover>
        </div>
      )}
    </Card>
  );
}

function MentorDetailsModal({ open, mentor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bio: "",
    features: "",
    specializations: "",
    isAvailable: true,
    status: "active",
    maximumNoOfMentees: 10,
    linkedin: "",
    github: "",
    website: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mentor) {
      setFormData({
        bio: mentor.bio || "",
        features: Array.isArray(mentor.features) ? mentor.features.join(", ") : "",
        specializations: Array.isArray(mentor.specializations) ? mentor.specializations.join(", ") : "",
        isAvailable: mentor.isAvailable !== false,
        status: mentor.status || "active",
        maximumNoOfMentees: mentor.maximumNoOfMentees || 10,
        linkedin: mentor.socialLinks?.linkedin || "",
        github: mentor.socialLinks?.github || "",
        website: mentor.socialLinks?.website || ""
      });
    }
  }, [mentor]);

  const submit = async () => {
    try {
      setLoading(true);
      await axios.post("/mentor-details", {
        mentorId: mentor?._id || mentor?.id,
        bio: formData.bio,
        features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
        specializations: formData.specializations.split(",").map(s => s.trim()).filter(Boolean),
        isAvailable: formData.isAvailable,
        status: formData.status,
        maximumNoOfMentees: parseInt(formData.maximumNoOfMentees) || 10,
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website
        }
      },{withCredentials:true});
      message.success("Mentor details updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      message.error("Failed to update mentor details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="Save Changes"
      className="!font-mono"
      okButtonProps={{ 
        className: "!bg-black !text-white !border-black !rounded-lg !h-12 !font-mono",
        loading 
      }}
      cancelButtonProps={{ className: "!border-black !rounded-lg !font-mono !h-12" }}
      width={800}
      destroyOnClose
    >
      <div className="space-y-6">
        <Title level={3} className="flex items-center gap-2">
          <UserOutlined /> {mentor?.name || "New Mentor"} - Complete Profile
        </Title>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AntInput.TextArea
            placeholder="Enter comprehensive bio (max 200 chars)"
            className="!border-black !rounded-lg !font-mono !h-24"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            maxLength={200}
            showCount
            autoSize={{ minRows: 3, maxRows: 4 }}
          />
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Status</label>
              <Space wrap>
                {['active', 'inactive', 'on-leave'].map(status => (
                  <Button 
                    key={status}
                    type={formData.status === status ? 'primary' : 'default'}
                    onClick={() => setFormData({...formData, status})}
                    className="!rounded-lg !font-mono"
                  >
                    {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </Space>
            </div>
            
            <AntInput
              placeholder="Max mentees (default: 10)"
              className="!border-black !rounded-lg !font-mono"
              value={formData.maximumNoOfMentees}
              onChange={(e) => setFormData({...formData, maximumNoOfMentees: e.target.value})}
              type="number"
              min={1}
              max={50}
            />
          </div>
        </div>

        {/* Tags & Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold mb-2 block">Specializations (comma separated)</label>
            <AntInput
              placeholder="JavaScript, React, Node.js, Python..."
              className="!border-black !rounded-lg !font-mono"
              value={formData.specializations}
              onChange={(e) => setFormData({...formData, specializations: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Key Features (comma separated)</label>
            <AntInput
              placeholder="1:1 mentoring, Code reviews, Career guidance..."
              className="!border-black !rounded-lg !font-mono"
              value={formData.features}
              onChange={(e) => setFormData({...formData, features: e.target.value})}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AntInput
            placeholder="LinkedIn URL"
            className="!border-black !rounded-lg !font-mono"
            value={formData.linkedin}
            onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
            prefix={<LinkOutlined />}
          />
          <AntInput
            placeholder="GitHub URL"
            className="!border-black !rounded-lg !font-mono"
            value={formData.github}
            onChange={(e) => setFormData({...formData, github: e.target.value})}
            prefix={<LinkOutlined />}
          />
          <AntInput
            placeholder="Personal Website"
            className="!border-black !rounded-lg !font-mono"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            prefix={<LinkOutlined />}
          />
        </div>

        <Divider>Availability</Divider>
        <div className="flex items-center gap-4">
          <Button
            type={formData.isAvailable ? 'primary' : 'default'}
            onClick={() => setFormData({...formData, isAvailable: true})}
            className="!rounded-lg !font-mono"
            icon={<CheckCircleOutlined />}
          >
            Available for new mentees
          </Button>
          <Button
            onClick={() => setFormData({...formData, isAvailable: false})}
            className="!rounded-lg !font-mono !border-black"
            icon={<ClockCircleOutlined />}
          >
            Currently Full
          </Button>
        </div>
      </div>
    </Modal>
  );
}
