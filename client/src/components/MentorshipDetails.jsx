"use client";
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Avatar,
  Button,
  Tag,
  Spin,
  Card,
  Tooltip,
  Progress,
} from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  StarFilled,
  ArrowLeftOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TrophyOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import Context from "../util/context";

const API = "http://localhost:4000";

const MentorshipDetails = () => {
  const { mentorId, planId } = useParams();
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);

  const [mentor, setMentor] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMentorship, setUserMentorship] = useState(null);

  /* -------------------- Guards -------------------- */
  useEffect(() => {
    if (!session && !sessionLoading) navigate("/login");
  }, [session, sessionLoading, navigate]);

  /* -------------------- Fetch Data -------------------- */
  useEffect(() => {
    if (session) {
      fetchMentor();
      fetchUserMentorship();
    }
  }, [session]);

  const fetchMentor = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentor-details/${mentorId}`,
        { withCredentials: true }
      );

      const mentorObj = Array.isArray(data) ? data[0] : data;
      setMentor(mentorObj);

      const plan = mentorObj?.plans?.find((p) => p._id === planId);
      setActivePlan(plan || null);
    } catch (err) {
      console.error("Fetch mentor failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMentorship = async () => {
    try {
      const { data } = await axios.get(
        `${API}/mentorship?mentorId=${mentorId}&userId=${session.id}&status=active`,
        { withCredentials: true }
      );
      setUserMentorship(data?.[0] || null);
    } catch (err) {
      console.error("Fetch mentorship failed:", err);
    }
  };

  const hasAccess = userMentorship?.planId === planId;

  if (loading || !mentor || !activePlan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-black text-white font-mono px-6 py-12">
      {/* ================= TOP COMMAND BAR ================= */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="bg-black border border-gray-700 text-gray-300 hover:text-white hover:border-white"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-wide leading-none">
              Mentorship Workspace
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {mentor.fullname} · {activePlan.title} Plan
            </p>
          </div>
        </div>

        {hasAccess ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-bold tracking-wide">
            <CheckCircleOutlined />
            ACTIVE SUBSCRIPTION
          </div>
        ) : (
          <div className="px-4 py-2 rounded-full border border-gray-700 text-xs text-gray-400">
            LIMITED ACCESS
          </div>
        )}
      </div>

      {/* ================= HERO GLASS PANEL ================= */}
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[28px] border border-gray-800 bg-gradient-to-br from-gray-950 via-black to-gray-950 p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_60%)] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row gap-12 justify-between">
          {/* LEFT */}
          <div className="flex gap-7">
            <div className="relative">
              <Avatar
                size={104}
                src={mentor.profileImage}
                className="border border-gray-700 bg-black"
              />
              {mentor.isAvailable && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 ring-4 ring-black" />
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {mentor.fullname || "Mentor"}
              </h2>
              <p className="text-gray-400 mt-1 text-sm">
                {activePlan.title} Mentorship
              </p>

              <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-gray-300">
                <span className="flex items-center gap-2">
                  <StarFilled className="text-yellow-400" />
                  {mentor.averageRating || 4.5} rating
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

              <div className="flex flex-wrap gap-2 mt-6">
                {mentor.specializations?.map((s, i) => (
                  <Tag
                    key={i}
                    className="bg-black/70 border-gray-700 text-gray-200 px-3 py-1 rounded-full"
                  >
                    {s}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — PLAN GLASS CARD */}
          <div className="w-full lg:w-[360px] relative overflow-hidden rounded-2xl border border-gray-800 bg-black/70 p-7 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_60%)] pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-300">
                <CrownOutlined />
                PLAN DETAILS
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight">
                {activePlan.title}
              </h3>

              <p className="text-gray-400 text-sm mt-1">
                ₹{activePlan.price} · {activePlan.duration} days
              </p>

              <div className="mt-5 flex items-center justify-between text-xs text-gray-400">
                <span>Plan Usage</span>
                <span>{hasAccess ? "Active" : "Inactive"}</span>
              </div>

              <Progress
                percent={hasAccess ? 100 : 35}
                showInfo={false}
                strokeWidth={6}
                trailColor="#1f1f1f"
                strokeColor="#ffffff"
                className="mt-2"
              />

              {hasAccess ? (
                <div className="mt-6 flex items-center gap-2 text-green-400 font-semibold text-sm">
                  <CheckCircleOutlined />
                  Full access enabled
                </div>
              ) : (
                <Button
                  size="large"
                  className="mt-6 w-full bg-white text-black font-semibold hover:bg-gray-200"
                  onClick={() => navigate(`/mentor/${mentorId}`)}
                >
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= METRIC STRIP ================= */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Mentorship Sessions"
          value={activePlan.title === "ADVANCED" ? "Unlimited" : "12 / month"}
          icon={<CalendarOutlined />}
        />
        <StatCard
          label="Response Time"
          value={activePlan.title === "ADVANCED" ? "< 2 hrs" : "< 12 hrs"}
          icon={<ThunderboltOutlined />}
        />
        <StatCard
          label="Success Rate"
          value="94%"
          icon={<TrophyOutlined />}
        />
        <StatCard
          label="Career Boost"
          value="+63%"
          icon={<RocketOutlined />}
        />
      </div>

      {/* ================= FEATURE ACCESS ================= */}
      <div className="max-w-7xl mx-auto mt-12 grid md:grid-cols-2 gap-8">
        <FeaturePanel
          title="What You Get"
          items={activePlan.whatCanDo}
          type="allowed"
        />
        <FeaturePanel
          title="Restricted Features"
          items={activePlan.whatCannotDo}
          type="locked"
        />
      </div>

      {/* ================= MODULE WORKSPACE ================= */}
      <div className="max-w-7xl mx-auto mt-14">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold tracking-wide">
            Mentorship Workspace
          </h3>
          <span className="text-xs text-gray-500">
            Access controlled by plan tier
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          <WorkspaceCard
            title="1-on-1 Sessions"
            description="Schedule private video calls with your mentor"
            icon={<CalendarOutlined />}
            enabled={hasAccess && activePlan.title !== "BASIC"}
            cta="Schedule Call"
          />

          <WorkspaceCard
            title="Mentor Chat"
            description="Direct async messaging with your mentor"
            icon={<MessageOutlined />}
            enabled={hasAccess}
            cta="Open Chat"
          />

          <WorkspaceCard
            title="Learning Resources"
            description="Premium curated roadmaps & materials"
            icon={<FileTextOutlined />}
            enabled={hasAccess}
            cta="Explore"
          />

          <WorkspaceCard
            title="Project Reviews"
            description="Architecture and code feedback"
            icon={<RocketOutlined />}
            enabled={hasAccess && activePlan.title !== "BASIC"}
            cta="Submit Project"
          />

          <WorkspaceCard
            title="Resume Optimization"
            description="Professional CV & LinkedIn review"
            icon={<ThunderboltOutlined />}
            enabled={hasAccess && activePlan.title !== "BASIC"}
            cta="Upload Resume"
          />

          <WorkspaceCard
            title="Mock Interviews"
            description="Real interview simulations with feedback"
            icon={<TrophyOutlined />}
            enabled={hasAccess && activePlan.title === "ADVANCED"}
            cta="Start Mock"
            premium
          />
        </div>
      </div>

      {/* ================= PREMIUM LOCK CTA ================= */}
      {!hasAccess && (
        <div className="max-w-7xl mx-auto mt-16 relative overflow-hidden rounded-[28px] border border-gray-800 bg-gradient-to-br from-gray-950 via-black to-gray-950 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_60%)] pointer-events-none" />

          <div className="relative">
            <h3 className="text-2xl font-bold tracking-tight">
              Unlock Your Full Mentorship Potential
            </h3>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Upgrade your plan to access private sessions, mock interviews,
              deep project reviews, and accelerated career growth.
            </p>
            <Button
              size="large"
              className="mt-8 bg-white text-black font-semibold hover:bg-gray-200 px-12"
              onClick={() => navigate(`/mentor/${mentorId}`)}
            >
              View Upgrade Options
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------- STAT CARD -------------------- */
const StatCard = ({ label, value, icon }) => {
  return (
    <div className="relative overflow-hidden bg-gray-950 border border-gray-800 rounded-2xl p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03),_transparent_60%)] pointer-events-none" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            {label}
          </p>
          <h4 className="text-xl font-bold mt-2">{value}</h4>
        </div>
        <div className="w-10 h-10 rounded-xl border border-gray-700 flex items-center justify-center text-gray-300">
          {icon}
        </div>
      </div>
    </div>
  );
};

/* -------------------- FEATURE PANEL -------------------- */
const FeaturePanel = ({ title, items, type }) => {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-2xl p-7">
      <h4 className="font-semibold tracking-wide mb-6">{title}</h4>
      <ul className="space-y-4 text-sm">
        {items
          ?.flatMap((x) => x.split(","))
          .map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              {type === "allowed" ? (
                <CheckCircleOutlined className="text-green-400 mt-[2px]" />
              ) : (
                <LockOutlined className="text-gray-500 mt-[2px]" />
              )}
              <span
                className={
                  type === "allowed" ? "text-gray-200" : "text-gray-500"
                }
              >
                {item.trim()}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};

/* -------------------- WORKSPACE CARD -------------------- */
const WorkspaceCard = ({
  title,
  description,
  icon,
  enabled,
  cta,
  premium,
}) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gray-950 p-7 transition-all duration-300 ${
        enabled
          ? "border-gray-800 hover:border-white hover:-translate-y-1"
          : "border-gray-800 opacity-60"
      }`}
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)] pointer-events-none" />

      {/* Premium badge */}
      {premium && (
        <div className="absolute top-4 right-4 text-[10px] px-2 py-1 rounded-full bg-white text-black font-bold tracking-widest">
          PRO
        </div>
      )}

      {/* Lock overlay */}
      {!enabled && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <Tooltip title="Upgrade plan to unlock">
            <LockOutlined className="text-xl text-gray-400" />
          </Tooltip>
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl border border-gray-700 flex items-center justify-center text-gray-300">
          {icon}
        </div>
        {enabled && (
          <span className="text-[10px] uppercase tracking-widest text-green-400">
            Enabled
          </span>
        )}
      </div>

      <h4 className="relative font-semibold tracking-wide mt-5">
        {title}
      </h4>
      <p className="relative text-gray-400 text-sm mt-2 leading-relaxed">
        {description}
      </p>

      <Button
        disabled={!enabled}
        className={`relative mt-6 w-full font-semibold ${
          enabled
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {cta}
      </Button>
    </div>
  );
};

export default MentorshipDetails;
