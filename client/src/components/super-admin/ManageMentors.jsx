"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users,
  Star,
  Plus,
  Trash2,
  RefreshCcw,
  UserCheck,
  Edit,
} from "lucide-react";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Tag,
  Spin,
  Popconfirm,
  Empty,
} from "antd";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ManageMentor() {
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchMentors = async () => {
    try {
      setLoading(true);

      // 1️⃣ Mentor users
      const userRes = await axios.get(`${API}/auth/mentors`, {
        withCredentials: true,
      });

      const mentorUsers =
        userRes.data?.mentors ||
        userRes.data?.data ||
        userRes.data ||
        [];

      // 2️⃣ Mentor details
      const detailsRes = await axios.get(`${API}/mentor-deatils`, {
        withCredentials: true,
      });

      const mentorDetails = detailsRes.data || [];

      // 3️⃣ Merge
      const merged = mentorUsers.map((user) => {
        const details = mentorDetails.find(
          (m) => String(m.mentorId) === String(user._id)
        );

        return {
          ...user,
          mentorDetailsId: details?._id || null,
          bio: details?.bio || "",
          specializations: details?.specializations || [],
          features: details?.features || [],
          noOfMentees: details?.noOfMentees || 0,
          maximumNoOfMentees: details?.maximumNoOfMentees || 0,
          averageRating: details?.averageRating || 0,
          status: details?.status || "inactive",
          isAvailable: details?.isAvailable ?? false,
          updatedAt: details?.updatedAt || user.updatedAt,
        };
      });

      setMentors(merged);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  /* ================= DELETE ================= */
  const removeMentor = async (mentorDetailsId) => {
    if (!mentorDetailsId) return;
    try {
      await axios.delete(`${API}/mentor-deatils/${mentorDetailsId}`, {
        withCredentials: true,
      });
      fetchMentors();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SEARCH ================= */
  const filteredMentors = mentors.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q) ||
      m.specializations?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "linear-gradient(135deg, #e0f2fe, #eef2ff, #f5e8ff)",
      }}
    >
      {/* HEADER */}
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#4338ca" }}>
            Mentor Management
          </h1>
          <p style={{ color: "#6b7280" }}>
            Users → Mentor Details (Merged)
          </p>
        </Col>

        <Col>
          <Input
            placeholder="Search mentor"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260, marginRight: 8 }}
          />
          <Button icon={<RefreshCcw size={16} />} onClick={fetchMentors}>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* GRID */}
      <div style={{ marginTop: 24 }}>
        {loading ? (
          <Spin size="large" />
        ) : filteredMentors.length === 0 ? (
          <Empty description="No mentors found" />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredMentors.map((mentor) => (
              <Col xs={24} sm={12} lg={8} key={mentor._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card hoverable style={{ borderRadius: 16 }}>
                    {/* HEADER */}
                    <Row justify="space-between" align="middle">
                      <Row align="middle" gutter={12}>
                        <Col>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background: "#e0e7ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <UserCheck />
                          </div>
                        </Col>
                        <Col>
                          <div style={{ fontWeight: 600 }}>
                            {mentor.name || mentor.email}
                          </div>
                          <Tag color={mentor.isAvailable ? "green" : "red"}>
                            {mentor.isAvailable
                              ? "Available"
                              : "Unavailable"}
                          </Tag>
                        </Col>
                      </Row>

                      {/* ACTIONS */}
                      <Row gutter={8}>
                        {mentor.mentorDetailsId && (
                          <>
                            {/* UPDATE */}
                            <Button
                              type="default"
                              shape="circle"
                              icon={<Edit size={16} />}
                              onClick={() =>
                                navigate(
                                  `/admin/mentors/update/${mentor.mentorDetailsId}`
                                )
                              }
                            />

                            {/* DELETE */}
                            <Popconfirm
                              title="Delete mentor?"
                              okText="Delete"
                              okButtonProps={{ danger: true }}
                              onConfirm={() =>
                                removeMentor(mentor.mentorDetailsId)
                              }
                            >
                              <Button
                                danger
                                shape="circle"
                                icon={<Trash2 size={16} />}
                              />
                            </Popconfirm>
                          </>
                        )}
                      </Row>
                    </Row>

                    {/* BIO */}
                    <p style={{ marginTop: 12 }}>
                      {mentor.bio || "No bio provided"}
                    </p>

                    {/* SKILLS */}
                    <div style={{ marginBottom: 8 }}>
                      {mentor.specializations.map((s, i) => (
                        <Tag key={i} color="blue">
                          {s}
                        </Tag>
                      ))}
                    </div>

                    {/* STATS */}
                    <Row gutter={12}>
                      <StatCard
                        icon={<Users />}
                        value={`${mentor.noOfMentees}/${mentor.maximumNoOfMentees}`}
                        label="Mentees"
                      />
                      <StatCard
                        icon={<Star />}
                        value={mentor.averageRating}
                        label="Rating"
                      />
                      <StatCard
                        icon={<Plus />}
                        value={mentor.features.length}
                        label="Features"
                      />
                    </Row>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({ icon, value, label }) {
  return (
    <Col span={8}>
      <Card size="small" style={{ textAlign: "center" }}>
        {icon}
        <div style={{ fontWeight: 600 }}>{value}</div>
        <small>{label}</small>
      </Card>
    </Col>
  );
}
