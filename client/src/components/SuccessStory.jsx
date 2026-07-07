import React, { useContext, useEffect } from "react";
import useSWR from "swr";
import { useNavigate, Link } from "react-router-dom";
import { Spin } from "antd";
import { motion } from "framer-motion";
import Context from "../util/context";
import { fetcher } from "../util/fetcher";
import {
  FaUsers,
  FaCompass,
  FaRocket,
  FaBriefcase,
  FaStar,
  FaTrophy,
  FaChartLine,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

const mentors = [
  {
    name: "Varun Jain",
    role: "Senior SDE at Microsoft",
    rating: 4.4,
    exp: "4+ Years Of Experience",
  },
  {
    name: "Subhradip Mishra",
    role: "Founder @AlgoVista",
    rating: 4.9,
    exp: "Young, energetic founder of AlgoVista, guiding 5000+ mentees. Java & Full-Stack MERN developer, DSA problem solver, DevOps enthusiast.",
  },
  {
    name: "Arpit Bhushan Sharma",
    role: "SDE-2 @GumRoad",
    rating: 4.3,
    exp: "5+ Years Of Experience",
  },
  {
    name: "Angad Dubey",
    role: "Software Engineer at Microsoft",
    rating: 4.5,
    exp: "5+ Years Of Experience",
  },
];

const SuccessStory = () => {
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) navigate("/login");
  }, [sessionLoading, session, navigate]);

  const { data, error, isLoading } = useSWR(
    session ? `${import.meta.env.VITE_API_URL}/success-story` : null,
    fetcher
  );

  if (isLoading || sessionLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#050505]">
        <Spin size="large" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-400 text-center mt-10 bg-[#050505] min-h-screen flex items-center justify-center font-mono">
        Failed to load success stories. Please try again.
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 overflow-x-hidden font-mono relative">

      {/* Floating Back to Home Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/50 border border-[rgba(250,204,21,0.2)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 text-gray-300 hover:text-[var(--primary)] font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(250,204,21,0.05)] cursor-pointer"
        >
          <FaArrowLeft className="text-xs" /> Back to Home
        </Link>
      </div>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center py-36 px-6 sm:px-10 overflow-hidden">
        {/* Gold glow orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgba(250,204,21,0.06)] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-[rgba(250,204,21,0.04)] rounded-full blur-[120px] pointer-events-none" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl"
        >
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] text-[var(--primary)]">
              <FaTrophy className="text-xs" /> Believe in your code — it's the first step to building your destiny.
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.2)] text-amber-300">
              <FaChartLine className="text-xs" /> Guiding bright minds — from your Bhaiya, Subhradip (Founder &amp; Instructor)
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-amber-400 to-yellow-300 animate-text-glow">
            "They Were Just Like You —<br />Until They Weren't"
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[var(--primary)]">
            Your Success Story Starts Here
          </h2>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            These aren't just testimonials — they're real journeys of people like you who transformed their careers through expert mentorship. Your success story could be next.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-14">
            {[
              { icon: <FaCompass />, text: "1:1 Mentorship from Experts" },
              { icon: <FaUsers />, text: "Personalized Career Guidance" },
              { icon: <FaRocket />, text: "Clear Career Direction" },
              { icon: <FaBriefcase />, text: "Interview Success Secrets" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.2)] hover:border-[rgba(250,204,21,0.5)] hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] transition-all duration-300 cursor-default"
              >
                <span className="text-[var(--primary)] text-xl">{item.icon}</span>
                <p className="text-sm sm:text-base font-medium whitespace-nowrap text-gray-200">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-center">
            {[
              { value: "200k+", label: "Trusted by Users" },
              { value: "10L+", label: "Average Package" },
              { value: "4.9/5", label: "Mentor Rating" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 w-36 sm:w-40 rounded-2xl bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.2)] hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] transition-transform hover:scale-105"
              >
                <p className="text-3xl sm:text-4xl font-extrabold mb-1 text-[var(--primary)]">
                  {stat.value}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SUCCESS STORIES GRID ── */}
      <section className="relative px-6 sm:px-8 pb-24 pt-10 z-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.04),transparent_70%)]" />

        {/* Heading */}
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--primary)] animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            Success Stories
          </h2>
          <p className="text-gray-400 mt-4 leading-relaxed max-w-xl">
            Real journeys of learners who transformed their careers through consistent effort and guidance.
          </p>
        </div>

        {/* Scrollable Cards */}
        <div className="relative overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 py-8 flex gap-8">
          {data?.map((story, index) => (
            <motion.div
              key={`${story._id}-${index}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="min-w-[340px] max-w-[340px] snap-center"
            >
              <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[rgba(250,204,21,0.12)] rounded-3xl shadow-[0_0_25px_rgba(250,204,21,0.04)] hover:-translate-y-2 hover:border-[rgba(250,204,21,0.35)] hover:shadow-[0_0_40px_rgba(250,204,21,0.1)] transition-all duration-500 px-6 py-6 cursor-pointer">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[rgba(250,204,21,0.1)] border border-[rgba(250,204,21,0.3)] flex items-center justify-center">
                    <span className="text-xl font-bold text-[var(--primary)]">
                      {story.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--primary)] tracking-wide">
                      {story.name}
                    </h3>
                    <p className="text-xs text-gray-500">@{story.name.toLowerCase().replace(/\s+/g, "")}</p>
                  </div>
                </div>

                {/* Review */}
                <p className="text-gray-300 text-sm italic leading-relaxed border-l-[2px] border-[rgba(250,204,21,0.3)] pl-4 mt-4">
                  "{story.description}"
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={i < story.rating ? "text-[var(--primary)]" : "text-gray-700"}
                    />
                  ))}
                </div>

                {/* Job */}
                <p className="mt-3 font-medium text-sm text-amber-300 uppercase tracking-wider">
                  {story.jobrole} • {story.companyname}
                </p>

                {/* Footer */}
                <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-[rgba(250,204,21,0.1)] space-y-1">
                  <p><span className="text-gray-600">Mentor:</span> {story.mentorEmail}</p>
                  <p><span className="text-gray-600">Date:</span> {new Date(story.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-4 flex items-center justify-center gap-3 opacity-40">
          <div className="w-20 h-[2px] bg-[var(--primary)]/30 rounded-full animate-pulse" />
          <div className="w-20 h-[2px] bg-[var(--primary)]/30 rounded-full animate-pulse delay-200" />
        </div>
      </section>

      {/* ── MENTORS / FREE TRIAL CTA ── */}
      <section className="w-full py-20 px-6 flex flex-col items-center relative grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.05),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center mb-14">
          <div className="px-5 py-1.5 mb-4 text-[var(--primary)] bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] rounded-full text-sm font-semibold">
            Free Trial Session
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-[var(--primary)] animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]">
            Connect <span className="text-amber-300">1:1</span> with Top Industry Experts for{" "}
            <span className="text-amber-300">FREE!</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            Your personalized mentorship journey starts here. Submit a query and get matched with a mentor to guide you towards your dream career.
          </p>
          <Link to="/mentorship-query">
            <button className="btn-yellow text-base px-8 py-3 flex items-center gap-2 cursor-pointer">
              Submit Your Query Now <FaArrowRight />
            </button>
          </Link>
          <div className="mt-5 text-gray-400 flex items-center justify-center gap-2">
            <FaUsers className="text-[var(--primary)] text-xl" />
            <span>5,860 peers already submitted</span>
          </div>
        </div>

        {/* Mentor Cards */}
        <div className="relative z-10 flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {mentors.map((m, i) => (
            <div
              key={i}
              className="glass-card px-7 py-5 w-64 flex flex-col items-start hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] transition-all duration-500"
            >
              <div className="flex items-center mb-3 w-full gap-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(250,204,21,0.1)] border border-[rgba(250,204,21,0.3)] flex items-center justify-center text-[var(--primary)] font-bold text-lg">
                  {m.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-[var(--primary)] font-semibold text-base">{m.name}</div>
                  <div className="text-gray-400 text-xs">{m.role}</div>
                </div>
              </div>
              <div className="mt-1 mb-1 flex items-center text-sm justify-between w-full">
                <span className="flex items-center gap-1 text-[var(--primary)]">
                  <FaStar className="text-xs" /> {m.rating}
                </span>
                <span className="text-gray-500 text-xs truncate max-w-[130px]">{m.exp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default SuccessStory;
