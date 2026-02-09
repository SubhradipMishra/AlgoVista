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
import { useParams, useNavigate } from "react-router-dom";
import { useRazorpay } from "react-razorpay";

import { useContext } from "react";
import Context from "../util/context";

const MentorProfile = () => {
  const { Razorpay } = useRazorpay();
  const navigate = useNavigate();
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { session, sessionLoading } = useContext(Context);
  const [activeTab, setActiveTab] = useState("profile");
  const [activeMentorships, setActiveMentorships] = useState([]);

  console.log(session);
  useEffect(() => {
    if (!session && !sessionLoading) navigate("/login");
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    if (session) {
      fetchMentor();
      fetchMentorships();
    }
  }, [session]);

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

  const fetchMentorships = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/mentorship?userId=${session.id}&mentorId=${id}&status=active`,
        { withCredentials: true }
      );
      setActiveMentorships(data || []);
    } catch (err) {
      console.error(err);
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

  const handleBuyNow = async (plan) => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/payment/mentorship/order",
        { productId: plan._id, mentorId: mentor.mentorId, userId: session.id },
        { withCredentials: true }
      );

      console.log(data);

      const options = {
        key: "rzp_test_RpG7PsiR24EZK5",
        amount: data.order.amount,
        currency: "INR",
        name: "AlgoVista",
        description: plan.title,
        order_id: data.order.id,
        handler: (response) => {
          alert("Payment Successfull");
        },
        prefill: {
          name: session.fullname,
          email: session.email,
          contact: "5647484939",
        },
        theme: {
          color: "#f37254",
        },
        notes: {
          name: session.fullname,
          user: session.id,
          product: plan._id,
          mentor: mentor.mentorId,
          discount: 0,
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", () => {
        alert("Payment Failed!");
      });
    } catch (err) {
      console.log(err);
      if (err.status === 401) return navigate("/login");
      console.error("Payment order failed:", err);
    }
  };

  const hasAnyActivePlan = activeMentorships.length > 0;

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
        </div>
      )}

      {/* ================= OFFERINGS ================= */}
      {activeTab === "offerings" && (
        <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-3 gap-8">
          {mentor.plans.map((plan, i) => {
            const maxPrice = Math.max(...mentor.plans.map((p) => p.price));

            // ⭐ RECOMMENDED LOGIC
            const isPro = plan.title?.toLowerCase() === "pro";
            const isPopular = isPro || plan.price === maxPrice;

            // 🔹 Convert comma-separated text into points
            const canDo = Array.isArray(plan.whatCanDo)
              ? plan.whatCanDo.flatMap((item) => item.split(","))
              : [];

            const cannotDo = Array.isArray(plan.whatCannotDo)
              ? plan.whatCannotDo.flatMap((item) => item.split(","))
              : [];

            const activePlan = activeMentorships.find(
              (m) => m.planId === plan._id
            );

            const isActivePlan = !!activePlan;
            const shouldDisable = hasAnyActivePlan && !isActivePlan;

            return (
              <div
                key={plan._id || i}
                className={`relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
            ${
              isPopular
                ? "border border-white bg-gradient-to-b from-gray-800 to-black shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                : "border border-gray-800 bg-gray-900"
            }`}
              >
                {/* ⭐ BADGES */}
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                    MOST POPULAR
                  </span>
                )}

                {isPro && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    PRO
                  </span>
                )}

                {/* HEADER */}
                <h3 className="text-xl font-bold tracking-wide">
                  {plan.title}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  {plan.duration / 30} Month{plan.duration > 30 ? "s" : ""}
                </p>

                {/* PRICE */}
                <p className="text-4xl font-extrabold mt-5">
                  ₹{plan.price}
                </p>

                <div className="h-px bg-gray-800 my-6" />

                {/* FEATURES */}
                <ul className="space-y-3 text-sm">
                  {canDo.map((item, idx) => (
                    <li
                      key={`can-${idx}`}
                      className="flex items-start gap-3 text-gray-200"
                    >
                      <span className="text-green-400 mt-[2px]">✔</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}

                  {cannotDo.map((item, idx) => (
                    <li
                      key={`cannot-${idx}`}
                      className="flex items-start gap-3 text-gray-500"
                    >
                      <span className="text-red-400 mt-[2px]">✖</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  disabled={!isActivePlan}
                  className={`mt-8 w-full font-semibold tracking-wide ${
                    isActivePlan
                      ? isPopular
                        ? "bg-white text-black hover:bg-gray-200"
                        : "border border-gray-600 text-white hover:bg-white hover:text-black"
                      : "bg-gray-800 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() =>
                    isActivePlan &&
                  navigate(`/mentorship/${mentor.mentorId}/${plan._id}`)

                  }
                >
                  {isActivePlan ? "Explore" : "Choose Plan"}
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
