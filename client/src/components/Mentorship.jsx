"use client";
import React, { useEffect, useState, useContext, useMemo } from "react";
import { Avatar, Button, Spin, message, Tag, Input, Switch } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Context from "../util/context";
import UserSidebar from "../components/UserSidebar";

const Mentorship = () => {
  const { session, sessionLoading } = useContext(Context);

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("mentorship");

  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);

      const usersRes = await axios.get(
        "http://localhost:4000/auth/mentors",
        { withCredentials: true }
      );

      const detailsRes = await axios.get(
        "http://localhost:4000/mentor-details",
        { withCredentials: true }
      );

      const mentorUsers = usersRes.data.mentors || [];
      const mentorDetails = detailsRes.data || [];

      const merged = mentorDetails
        .map((detail) => {
          const user = mentorUsers.find(
            (u) => u._id === detail.mentorId
          );
          if (!user) return null;

          return {
            _id: user._id,
            fullname: user.fullname,
            profileImage: user.profileImage,
            bio: detail.bio || user.description,
            specializations: detail.specializations || [],
            isAvailable: detail.isAvailable,
          };
        })
        .filter(Boolean);

      setMentors(merged);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch mentors");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtered mentors
  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        mentor.fullname.toLowerCase().includes(searchText) ||
        mentor.bio?.toLowerCase().includes(searchText) ||
        mentor.specializations.some((s) =>
          s.toLowerCase().includes(searchText)
        );

      const matchesAvailability = onlyAvailable
        ? mentor.isAvailable
        : true;

      return matchesSearch && matchesAvailability;
    });
  }, [mentors, search, onlyAvailable]);

  if (sessionLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white font-mono">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white font-mono">
      {/* Sidebar */}
      <UserSidebar
        user={session}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        navigate={navigate}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Mentorship
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl">
            Find mentors and explore their profiles for detailed guidance.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search mentor, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f0f0f] border border-gray-800 text-white placeholder-gray-500 rounded-lg"
          />

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Switch
              checked={onlyAvailable}
              onChange={setOnlyAvailable}
            />
            <span>Available only</span>
          </div>
        </div>

        {/* Mentor Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="
                  bg-[#0c0c0c]
                  border border-gray-800
                  rounded-2xl
                  p-6
                  transition-all
                  hover:-translate-y-1
                  hover:border-gray-600
                  hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]
                "
              >
                {/* Availability */}
                {mentor.isAvailable && (
                  <div className="mb-3 inline-block text-xs bg-white text-black px-3 py-1 rounded-full font-semibold">
                    Available
                  </div>
                )}

                {/* Profile */}
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    size={82}
                    src={
                      mentor.profileImage ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    className="mb-4 border border-gray-700"
                  />

                  <h2 className="text-lg font-semibold tracking-wide">
                    {mentor.fullname}
                  </h2>

                  <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                    {mentor.bio || "Experienced mentor"}
                  </p>

                  {/* Specializations */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {mentor.specializations
                      .slice(0, 3)
                      .map((spec, i) => (
                        <Tag
                          key={i}
                          style={{
                            backgroundColor: "#111",
                            borderColor: "#333",
                            color: "#f1f5f9",
                            fontSize: 12,
                          }}
                        >
                          {spec}
                        </Tag>
                      ))}
                  </div>

                  {/* CTA */}
                  <Button
                    className="
                      mt-6
                      w-full
                      bg-white
                      text-black
                      border-none
                      font-semibold
                      hover:bg-gray-200
                    "
                    onClick={() =>
                      navigate(`/mentor/${mentor._id}`)
                    }
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full text-center mt-20">
              No mentors match your search.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Mentorship;
