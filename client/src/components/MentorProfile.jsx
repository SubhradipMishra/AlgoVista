"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Button, Tag, Spin, Dropdown } from "antd";
import {
  LinkedinOutlined,
  GithubOutlined,
  GlobalOutlined,
  StarFilled,
  MoreOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useParams } from "react-router-dom";

const MentorProfile = () => {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchMentor();
  }, []);

  const fetchMentor = async () => {
    try {
      const usersRes = await axios.get(
        "http://localhost:4000/auth/mentors",
        { withCredentials: true }
      );

      const detailsRes = await axios.get(
        "http://localhost:4000/mentor-details",
        { withCredentials: true }
      );

      const user = usersRes.data.mentors.find((m) => m._id === id);
      const detail = detailsRes.data.find((d) => d.mentorId === id);

      if (!user || !detail) return;
      setMentor({ ...user, ...detail });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !mentor) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const menuItems = [
    { key: "1", label: "Save Mentor" },
    { key: "2", label: "Share Profile" },
    { key: "3", label: "Report" },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono px-6 py-10">
      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Avatar
            size={96}
            src={mentor.profileImage}
            className="border border-gray-700"
          />

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{mentor.fullname}</h1>
                <p className="text-gray-400 mt-1">Mentor</p>
                <p className="text-gray-400 mt-3 max-w-xl">
                  {mentor.bio || mentor.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button className="border border-gray-600 text-white hover:bg-white hover:text-black">
                  Follow
                </Button>

                <Dropdown
                  menu={{ items: menuItems }}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <Button
                    icon={<MoreOutlined />}
                    className="border border-gray-700 text-gray-300 hover:text-white"
                  />
                </Dropdown>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <StarFilled className="text-yellow-400" />
                {mentor.averageRating || 4.5}
              </span>

              <span>
                {mentor.noOfMentees}/{mentor.maximumNoOfMentees} mentees
              </span>

              <span
                className={
                  mentor.isAvailable ? "text-green-400" : "text-red-400"
                }
              >
                {mentor.isAvailable ? "Available" : "Busy"}
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {mentor.specializations.map((s, i) => (
                <Tag
                  key={i}
                  className="bg-black border-gray-700 text-gray-200"
                >
                  {s}
                </Tag>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-4 mt-5 text-lg text-gray-400">
              {mentor.socialLinks?.linkedin && (
                <a href={mentor.socialLinks.linkedin} target="_blank">
                  <LinkedinOutlined />
                </a>
              )}
              {mentor.socialLinks?.github && (
                <a href={mentor.socialLinks.github} target="_blank">
                  <GithubOutlined />
                </a>
              )}
              {mentor.socialLinks?.website && (
                <a href={mentor.socialLinks.website} target="_blank">
                  <GlobalOutlined />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="max-w-6xl mx-auto mt-10 border-b border-gray-800 flex gap-8 text-gray-400">
        {["profile", "offerings", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-white text-white"
                : "hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= PROFILE ================= */}
      {activeTab === "profile" && (
        <div className="max-w-6xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Experience</h3>
            <p className="text-gray-400">{mentor.experience}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Education</h3>
            <p className="text-gray-400">{mentor.education}</p>
          </div>

          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-400 leading-relaxed">
              {mentor.description}
            </p>
          </div>
        </div>
      )}

      {/* ================= OFFERINGS ================= */}
      
{activeTab === "offerings" && (
  <div className="max-w-6xl mx-auto mt-10 grid md:grid-cols-3 gap-8">
    {mentor.plans.map((plan, i) => {
      const maxPrice = Math.max(...mentor.plans.map(p => p.price));
      const isPopular = plan.price === maxPrice;

      return (
        <div
          key={plan._id || i}
          className={`relative bg-gray-900 border rounded-2xl p-6 ${
            isPopular ? "border-white" : "border-gray-800"
          }`}
        >
          {isPopular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </span>
          )}

          <h3 className="text-xl font-bold">{plan.title}</h3>
          <p className="text-gray-400 text-sm">
            {plan.duration / 30} Month{plan.duration > 30 ? "s" : ""}
          </p>

          <p className="text-3xl font-extrabold mt-4">
            ₹{plan.price}
          </p>

          <div className="h-px bg-gray-800 my-6" />

          <ul className="space-y-3 text-sm">
            {plan.whatCanDo.map((item, idx) => (
              <li key={`can-${idx}`} className="flex items-center gap-3 text-gray-200">
                <span>✓</span>
                {item}
              </li>
            ))}

            {plan.whatCannotDo.map((item, idx) => (
              <li key={`cannot-${idx}`} className="flex items-center gap-3 text-gray-500">
                <span>✕</span>
                {item}
              </li>
            ))}
          </ul>

          <Button
            className={`mt-8 w-full font-semibold ${
              isPopular
                ? "bg-white text-black hover:bg-gray-200"
                : "border border-gray-600 text-white hover:bg-white hover:text-black"
            }`}
          >
            Choose Plan
          </Button>
        </div>
      );
    })}
  </div>
)}


      {/* ================= REVIEWS ================= */}
      {activeTab === "reviews" && (
        <div className="max-w-6xl mx-auto mt-10 bg-gray-900 border border-gray-800 rounded-xl py-20 text-center text-gray-400">
          Reviews coming soon.
        </div>
      )}
    </div>
  );
};

export default MentorProfile;
