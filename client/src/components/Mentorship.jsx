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
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-28 relative z-10">
        {/* Header */}
        <div className="mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] text-[var(--primary)] mb-4">
            Elite Guidance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--primary)] tracking-wide animate-text-glow leading-none">
            Mentorship
          </h1>
          <p className="text-gray-400 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
            Partner with industry-leading engineers, explore custom paths, and accelerate your engineering journey.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-12">
          <div className="flex-1">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-[var(--primary)] mr-2" />}
              placeholder="Search mentor name, specialization, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!bg-[#07070a]/90 !border !border-[rgba(250,204,21,0.15)] hover:!border-[var(--primary)] focus:!border-[var(--primary)] !text-white placeholder-gray-600 rounded-xl py-3 px-4 font-mono text-sm shadow-[0_0_15px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#07070a]/90 border border-[rgba(250,204,21,0.15)] text-sm text-gray-300 font-semibold shadow-[0_0_15px_rgba(0,0,0,0.4)]">
            <Switch
              checked={onlyAvailable}
              onChange={setOnlyAvailable}
              className="bg-gray-800 checked:bg-[var(--primary)]"
            />
            <span>Available Mentors Only</span>
          </div>
        </div>

        {/* Mentor Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="group relative rounded-3xl p-6 bg-[#07070a]/95 border border-[rgba(250,204,21,0.12)] hover:border-[var(--primary)] hover:shadow-[0_0_50px_rgba(250,204,21,0.15)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
              >
                {/* Tech Bracket Corners */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[var(--primary)] opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[var(--primary)] opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[var(--primary)] opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[var(--primary)] opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>

                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(250,204,21,0.02)] rounded-full blur-xl pointer-events-none"></div>

                <div>
                  {/* Availability Badge */}
                  <div className="flex justify-between items-center mb-5">
                    {mentor.isAvailable ? (
                      <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold bg-green-950/20 border border-green-900/30 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Available
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold bg-red-950/20 border border-red-900/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Fully Booked
                      </span>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      {/* Rotating halo ring behind avatar */}
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-[var(--primary)] opacity-0 group-hover:opacity-70 blur-[3px] group-hover:animate-spin transition-all duration-700 pointer-events-none" style={{ animationDuration: '3s' }}></div>
                      
                      <Avatar
                        size={82}
                        src={
                          mentor.profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        className="relative border border-[rgba(250,204,21,0.2)] bg-black shadow-lg z-10"
                      />
                      {mentor.isAvailable && (
                        <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-black z-20" />
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-gray-100 group-hover:text-[var(--primary)] transition-colors">
                      {mentor.fullname}
                    </h2>

                    <p className="text-gray-400 text-xs mt-3 line-clamp-2 leading-relaxed min-h-[32px]">
                      {mentor.bio || "Experienced technical leader and engineering mentor."}
                    </p>

                    {/* Specializations */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                      {mentor.specializations
                        .slice(0, 3)
                        .map((spec, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold text-amber-300/80 bg-black/60 border border-amber-950/30 px-2 py-0.5 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className="mt-6 w-full btn-outline py-2.5 text-xs font-bold transition-all duration-300"
                  onClick={() => navigate(`/mentor/${mentor._id}`)}
                >
                  View Full Profile
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 rounded-3xl border border-[rgba(250,204,21,0.1)] bg-black/40">
              <p className="text-gray-500 text-sm">No mentors found matching the search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Mentorship;
