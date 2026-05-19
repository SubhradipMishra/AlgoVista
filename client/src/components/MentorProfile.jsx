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
        key: "rzp_test_SrKIlIS4UjIGK5",
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
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 pt-28 relative z-10 font-mono">
        
        {/* ================= HEADER ================= */}
        <div className="rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-8 md:p-10 mb-10 shadow-[0_0_50px_rgba(250,204,21,0.03)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(250,204,21,0.03)] rounded-full blur-xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative">
              <Avatar
                size={96}
                src={mentor.profileImage}
                className="border border-[rgba(250,204,21,0.2)] bg-black shadow-lg"
              />
              {mentor.isAvailable && (
                <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-black animate-pulse" />
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl font-black text-white">{mentor.fullname}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.2)] px-2.5 py-0.5 rounded-full">
                      Elite Mentor
                    </span>
                    <span className="text-gray-500 text-sm">| Professional Guidance</span>
                  </div>
                  <p className="text-gray-400 mt-4 text-sm md:text-base leading-relaxed max-w-2xl">
                    {mentor.bio || mentor.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="btn-outline text-xs py-2 px-5 font-bold transition-all duration-300">
                    Follow
                  </button>

                  <Dropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    trigger={["click"]}
                  >
                    <Button
                      icon={<MoreOutlined />}
                      className="!bg-black/60 !border-[rgba(250,204,21,0.25)] !text-gray-300 hover:!text-[var(--primary)] hover:!border-[var(--primary)] h-9 w-9 rounded-xl flex items-center justify-center"
                    />
                  </Dropdown>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-6 mt-6 text-xs md:text-sm text-gray-300 font-semibold">
                <span className="flex items-center gap-2">
                  <StarFilled className="text-[var(--primary)] text-sm" />
                  <span className="text-white">{mentor.averageRating || 4.5} Rating</span>
                </span>

                <span className="text-gray-400">
                  <span className="text-white">{mentor.noOfMentees}</span>/{mentor.maximumNoOfMentees} Mentees Active
                </span>

                <span className={mentor.isAvailable ? "text-green-400" : "text-red-400"}>
                  {mentor.isAvailable ? "● Available to Accept" : "● Fully Booked"}
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mt-6">
                {mentor.specializations.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold text-amber-300/80 bg-black/60 border border-[rgba(250,204,21,0.15)] px-3 py-1 rounded-md"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Social links */}
              <div className="flex gap-4 mt-6 text-lg text-gray-400">
                {mentor.socialLinks?.linkedin && (
                  <a href={mentor.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-[var(--primary)] transition-colors">
                    <LinkedinOutlined />
                  </a>
                )}
                {mentor.socialLinks?.github && (
                  <a href={mentor.socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-[var(--primary)] transition-colors">
                    <GithubOutlined />
                  </a>
                )}
                {mentor.socialLinks?.website && (
                  <a href={mentor.socialLinks.website} target="_blank" rel="noreferrer" className="hover:text-[var(--primary)] transition-colors">
                    <GlobalOutlined />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="mt-10 border-b border-gray-900 flex gap-8 text-sm font-bold uppercase tracking-wider text-gray-500 mb-8">
          {["profile", "offerings", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-all relative ${
                activeTab === tab
                  ? "text-[var(--primary)]"
                  : "hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--primary)]" />
              )}
            </button>
          ))}
        </div>

        {/* ================= PROFILE ================= */}
        {activeTab === "profile" && (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-3xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/90 p-6 md:p-8">
              <h3 className="text-sm uppercase tracking-widest text-[var(--primary)] font-bold mb-4">Experience</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{mentor.experience || "Multiple years of building production scale systems."}</p>
            </div>

            <div className="rounded-3xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/90 p-6 md:p-8">
              <h3 className="text-sm uppercase tracking-widest text-[var(--primary)] font-bold mb-4">Education</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{mentor.education || "Bachelor of Technology in Computer Science."}</p>
            </div>
          </div>
        )}

        {/* ================= OFFERINGS ================= */}
        {activeTab === "offerings" && (
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {mentor.plans.map((plan, i) => {
              const maxPrice = Math.max(...mentor.plans.map((p) => p.price));
              const isPro = plan.title?.toLowerCase() === "pro";
              const isPopular = isPro || plan.price === maxPrice;

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

              return (
                <div
                  key={plan._id || i}
                  className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between overflow-hidden
                    ${
                      isPopular
                        ? "border-2 border-[var(--primary)] bg-gradient-to-b from-[#0e0e02] to-[#040400] shadow-[0_0_40px_rgba(250,204,21,0.12)]"
                        : "border border-[rgba(250,204,21,0.12)] bg-[#07070a]/90"
                    }`}
                >
                  {isPopular && (
                    <span className="absolute top-0 right-1/2 translate-x-1/2 bg-[var(--primary)] text-black text-[10px] font-black tracking-widest px-4 py-1 rounded-b-xl uppercase">
                      Popular Choice
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">
                          {plan.title}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">
                          {plan.duration / 30} Month{plan.duration > 30 ? "s" : ""} Access
                        </p>
                      </div>
                      {isPro && (
                        <span className="text-[10px] font-black tracking-widest text-[var(--primary)] border border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.08)] px-2 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-xs text-gray-500 font-bold font-mono">INR</span>
                      <span className="text-4xl font-black text-white ml-1.5">₹{plan.price}</span>
                    </div>

                    <div className="h-px bg-gray-900 mb-6" />

                    {/* Features list */}
                    <ul className="space-y-3.5 text-xs text-gray-300">
                      {canDo.map((item, idx) => (
                        <li key={`can-${idx}`} className="flex items-start gap-2.5">
                          <span className="text-green-400 font-bold select-none">✓</span>
                          <span>{item.trim()}</span>
                        </li>
                      ))}

                      {cannotDo.map((item, idx) => (
                        <li key={`cannot-${idx}`} className="flex items-start gap-2.5 text-gray-600">
                          <span className="text-red-500 font-bold select-none">✕</span>
                          <span>{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => {
                      if (isActivePlan) {
                        navigate(`/mentorship/${mentor.mentorId}/${plan._id}`);
                      } else {
                        handleBuyNow(plan);
                      }
                    }}
                    className={`mt-8 w-full py-3 px-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
                      isActivePlan
                        ? "bg-green-500/10 border border-green-500/40 text-green-400 hover:bg-green-500/20 cursor-pointer"
                        : isPopular
                        ? "bg-[var(--primary)] text-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.25)] cursor-pointer"
                        : "btn-outline cursor-pointer"
                    }`}
                  >
                    {isActivePlan ? "Explore Workspace" : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= REVIEWS ================= */}
        {activeTab === "reviews" && (
          <div className="mt-6 rounded-3xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/90 py-20 text-center text-gray-500 text-sm">
            Student feedback log is currently generating. Reviews coming soon.
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorProfile;
