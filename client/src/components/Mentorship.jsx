"use client";
import React, { useEffect, useState, useContext } from "react";
import { Avatar, Button, Spin, message, Tag } from "antd";
import { StarFilled, ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Context from "../util/context";
import UserSidebar from "../components/UserSidebar";

const Mentorship = () => {
  const { session, sessionLoading } = useContext(Context);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("mentorship");

  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:4000/auth/mentors", {
        withCredentials: true,
      });
      setMentors(data.mentors || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch mentors");
    } finally {
      setLoading(false);
    }
  };

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
      <main className="relative flex-1 p-8 overflow-auto grid-bg">
        {/* Soft glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Mentorship
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl">
            Learn directly from experienced mentors and accelerate your growth.
          </p>
        </div>

        {/* Mentor Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mentors.length > 0 ? (
            mentors.map((mentor) => (
              <div
                key={mentor._id}
                className="group relative bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6
                hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]
                transition-all duration-300"
              >
                {/* Verified Badge */}
                {mentor.verified && (
                  <div className="absolute top-4 right-4 text-xs bg-white text-black px-3 py-1 rounded-full font-bold">
                    Verified
                  </div>
                )}

                {/* Profile */}
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    size={88}
                    src={mentor.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    className="mb-4 border-2 border-gray-600 group-hover:border-white transition"
                  />

                  <h2 className="text-xl font-semibold">{mentor.fullname}</h2>
                  <p className="text-gray-500 text-sm">{mentor.email}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <StarFilled className="text-yellow-400" />
                    <span>{mentor.rating?.avg || "4.8"}</span>
                    <span className="text-gray-500">
                      ({mentor.rating?.count || 120})
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mt-4 line-clamp-3">
                    {mentor.description ||
                      "Passionate mentor helping students grow in tech careers."}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {(mentor.skills || []).slice(0, 4).map((skill, i) => (
                      <Tag
                        key={i}
                        style={{
                          backgroundColor: "#111",
                          borderColor: "#333",
                          color: "#f1f5f9",
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3 mt-6 w-full">
                    <Button
                      type="primary"
                      className="flex-1 bg-white text-black border-none font-semibold hover:bg-gray-200"
                      onClick={() => navigate(`/mentor/${mentor._id}`)}
                    >
                      View Profile
                    </Button>

                    <Button
                      icon={<ThunderboltOutlined />}
                      className="flex-1 border border-white text-white font-semibold
                      hover:bg-white hover:text-black transition"
                    >
                      Take Mentorship
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center col-span-full">
              No mentors available at the moment.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Mentorship;
