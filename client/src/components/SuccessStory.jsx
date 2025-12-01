"use client";
import React, { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { useNavigate, Link } from "react-router-dom";
import { Card, Spin, message, Drawer, Button } from "antd";
import { StarFilled, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import Context from "../util/context";
import { fetcher } from "../util/fetcher";
import { FaUserCircle } from "react-icons/fa";

const SuccessStory = () => {
  const navigate = useNavigate();
  const { session, sessionLoading, setSession } = useContext(Context);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
    
      navigate("/login");
      return;
    }
  }, [sessionLoading, session, navigate]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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
exp: "Young, energetic mentor and founder of AlgoVista, guiding 5000+ mentees to achieve their dream careers. Java & Full-Stack MERN developer, DSA problem solver, DevOps enthusiast, and a trusted guide—like a big brother to every student."
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

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setSession(null);
    } catch (err) {
      console.error(err);
    }
  };

  const { data, error, isLoading } = useSWR(
    session ? "http://localhost:4000/success-story" : null,
    fetcher
  );

  if (isLoading || sessionLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#050510] text-white">
        <Spin size="large" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-400 text-center mt-10 bg-[#050510] min-h-screen">
        Failed to load success stories 😞
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col text-gray-200 bg-[#050510] overflow-x-hidden">
      {/* Navbar */}
      {/* (Navbar code unchanged) */}
      {/* ... your navbar code remains the same ... */}
      <nav
  className={`fixed top-0 z-50 w-full transition-all duration-300 font-mono ${
    isScrolled
      ? "backdrop-blur-md bg-[#0f0f14] shadow-md py-3"
      : "bg-[#0f0f14] py-5"
  }`}
>
  <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8">
    <h1 className="text-4xl font-extrabold tracking-tight text-purple-500">AlgoVista</h1>

    {/* Desktop Menu */}
    <div className="hidden md:flex space-x-6 items-center text-lg font-semibold relative">
      <Link
        to="/"
        className="relative text-gray-300 hover:text-purple-500 transition-all group"
      >
        Home
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      {/* Resources Dropdown (hover) */}
      <div className="relative group">
        <button className="flex items-center gap-1 text-gray-300 hover:text-purple-500 transition-all">
          Resources
          <span className="ml-1 transform transition-transform duration-300 group-hover:rotate-180">▼</span>
        </button>
        <div className="absolute left-0 mt-3 w-64 bg-[#1a1a24] rounded-2xl shadow-2xl p-4 space-y-3 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 invisible group-hover:visible transition-all duration-300 origin-top">
          {[
            { name: "SDE Sheet", icon: "📝", tag: "New" },
            { name: "System Design", icon: "⚙️" },
            { name: "Core Subjects", icon: "📚" },
            { name: "Interview Story", icon: "💬", tag: "New" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-[#0f0f14] hover:bg-[#1a1a24] hover:scale-[1.02] rounded-lg shadow-sm cursor-pointer transition-all"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
              {item.tag && (
                <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/roadmaps"
        className="relative text-gray-300 hover:text-purple-500 transition-all group"
      >
        Roadmap
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link
        to="/problems"
        className="relative text-gray-300 hover:text-purple-500 transition-all group"
      >
        Problems
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link
        to="success-stories"
        className="relative text-gray-300 hover:text-purple-500 transition-all group"
      >
        Success Stories
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link
        to="#reviews"
        className="relative text-gray-300 hover:text-purple-500 transition-all group"
      >
        Reviews
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      {/* User session */}
      {session ? (
        <div className="relative group">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#1a1a24]/80 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(128,0,255,0.15)] hover:shadow-[0_0_25px_rgba(128,0,255,0.35)] backdrop-blur-sm">
            <div className="relative">
              <FaUserCircle size={28} className="text-purple-500 group-hover:text-purple-400 transition-colors duration-300" />
              <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-[#0f0f14] shadow-[0_0_5px_rgba(0,255,0,0.6)]"></span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-100 text-sm">{session.fullname}</span>
              <span className="text-xs text-gray-400 tracking-tight">{session.email?.split("@")[0]}</span>
            </div>
            <span className="ml-2 text-gray-400 group-hover:text-purple-500 transition-transform duration-300 group-hover:rotate-180">▼</span>
          </div>

          <div className="absolute right-0 mt-3 w-64 bg-gradient-to-br from-[#1a1a24]/95 via-[#111]/90 to-[#1a1a24]/95 border border-purple-500/30 rounded-2xl shadow-[0_0_25px_rgba(128,0,255,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-right backdrop-blur-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-purple-500/20 bg-[#111]/60 flex items-center gap-3">
              <FaUserCircle className="text-purple-500 text-2xl" />
              <div>
                <p className="font-semibold text-gray-100 text-sm">{session.fullname}</p>
                <p className="text-xs text-gray-400 truncate">{session.email}</p>
              </div>
            </div>

            <ul className="py-2">
              <li>
                <Link
                  to={session.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  className="flex items-center gap-3 px-5 py-2.5 text-gray-200 hover:text-purple-500 hover:bg-purple-500/10 transition-all duration-200"
                >
                  <span className="text-lg">📊</span>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-5 py-2.5 text-left text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-all duration-200"
                >
                  <span className="text-lg">🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <Link to="/login">
            <Button className="border-purple-400 text-purple-400 hover:bg-[#1a1a24] font-semibold">Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-purple-600 hover:bg-purple-700 font-semibold border-none text-white">Sign Up</Button>
          </Link>
        </>
      )}
    </div>

    {/* Mobile Hamburger */}
    <div className="md:hidden flex items-center">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-purple-500 text-2xl focus:outline-none"
      >
        {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
      </button>
    </div>
  </div>

  {/* Mobile Menu */}
  {menuOpen && (
    <div className="md:hidden bg-[#0f0f14]/95 backdrop-blur-md shadow-md w-full absolute top-full left-0 flex flex-col items-center py-4 space-y-4 animate-slide-down">
      {[
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
        { name: "Roadmap", path: "/roadmaps" },
        { name: "Problems", path: "/problems" },
        { name: "Success Stories", path: "/success-stories" },
        { name: "Reviews", path: "/reviews" },
      ].map((item, i) => (
        <div key={i} className="w-full flex flex-col items-center">
          <Link
            to={item.path}
            className="text-gray-300 hover:text-purple-500 font-semibold text-lg w-full text-center py-2"
            onClick={() => setMenuOpen(false)}
          >
            {item.name}
          </Link>
        </div>
      ))}

      {session ? (
        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white w-32"
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <Link to="/login">
            <Button
              type="default"
              className="border-purple-400 text-purple-400 hover:bg-[#1a1a24] font-semibold w-32"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              type="primary"
              className="bg-purple-600 hover:bg-purple-700 font-semibold border-none w-32"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </div>
  )}
</nav>


      {/* ✅ HERO SECTION */}
     <section className="relative flex flex-col items-center justify-center text-center py-32 px-6 sm:px-10 bg-black font-mono text-white">
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className="max-w-4xl"
  >
    <div className="flex flex-col">
      {/* Tagline 1 */}
      <div className="inline-block mb-4 px-4 py-1 rounded-full text-sm font-medium bg-white/10 border border-white/20">
        🔥 Believe in your code — it’s the first step to building your destiny.
      </div>

      {/* Tagline 2 */}
      <div className="inline-block mb-4 px-4 py-1 rounded-full text-sm font-medium bg-white/10 border border-white/20">
        🌟 Guiding bright minds, shaping careers — with love and mentorship, from your Bhaiya, Subhradip (Founder & Instructor)
      </div>
    </div>

    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
      “They Were Just Like You — Until They Weren’t”
    </h1>

    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
      Your Success Story Starts Here
    </h2>

    <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
      These success stories aren’t just testimonials—they’re real journeys of people like you who transformed their careers through expert mentorship. Your success story could be next.
    </p>

    {/* Highlights */}
    <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-14">
      {[
        { icon: "🎯", text: "1:1 Mentorship from Experts" },
        { icon: "🧭", text: "Personalized Career Guidance" },
        { icon: "🚀", text: "Clear Career Direction" },
        { icon: "💼", text: "Interview Success Secrets" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/20 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 cursor-default"
        >
          <span className="text-2xl">{item.icon}</span>
          <p className="text-sm sm:text-base font-medium whitespace-nowrap">
            {item.text}
          </p>
        </motion.div>
      ))}
    </div>

    {/* Stats */}
    <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
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
          className="p-5 w-36 sm:w-40 rounded-2xl bg-white/5 border border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
        >
          <p className="text-3xl sm:text-4xl font-extrabold mb-1">
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


  {/* 💎 SUCCESS STORIES GRID WITH INFINITE SCROLL */}

<section className="relative px-8 pb-24 pt-10 z-20 bg-black font-mono text-white overflow-hidden">

  {/* Subtle Noise / Glow Background */}
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_70%)] opacity-40"></div>
  </div>

  {/* Heading */}
  <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
      Success Stories
    </h2>
    <p className="text-gray-400 mt-3 leading-relaxed max-w-xl">
      Real journeys of learners who transformed their careers through consistent effort and guidance.
    </p>
  </div>

  {/* Scrollable Cards */}
  <div className="relative overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 py-8 flex gap-10">

    {data?.map((story, index) => (
      <motion.div
        key={`${story._id}-${index}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.12 }}
        viewport={{ once: true }}
        className="min-w-[340px] max-w-[340px] snap-center"
      >
        <div
          className="
            bg-[#0f0f0f]/70 backdrop-blur-md 
            border border-white/10
            rounded-3xl 
            shadow-[0_0_25px_rgba(255,255,255,0.04)]
            hover:-translate-y-2 hover:shadow-[0_0_45px_rgba(255,255,255,0.08)]
            transition-all duration-500
            px-6 py-6 cursor-pointer
          "
        >
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {story.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">
                {story.name}
              </h3>
              <p className="text-xs text-gray-500">@{story.name.toLowerCase().replace(/\s+/g, "")}</p>
            </div>
          </div>

          {/* Review */}
          <p className="text-gray-300 text-sm italic leading-relaxed border-l-[2px] border-white/10 pl-4 mt-4">
            “{story.description}”
          </p>

          {/* Rating (mono style stars) */}
          <div className="flex items-center gap-1 mt-3">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i < story.rating ? "text-white" : "text-gray-700"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Job */}
          <p className="mt-3 font-medium text-sm text-gray-200 uppercase tracking-wider">
            {story.jobrole} • {story.companyname}
          </p>

          {/* Footer */}
          <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-white/10 space-y-1">
            <p><span className="text-gray-600">Mentor:</span> {story.mentorEmail}</p>
            <p><span className="text-gray-600">Date:</span> {new Date(story.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>

  {/* Scroll Indicator */}
  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-40">
    <div className="w-20 h-[2px] bg-white/20 rounded-full animate-pulse"></div>
    <div className="w-20 h-[2px] bg-white/20 rounded-full animate-pulse delay-200"></div>
  </div>
</section>












<section className="w-full py-16 flex flex-col items-center bg-black font-mono text-white relative grid-bg">
  <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
    <div className="px-6 py-1 mb-3 text-white/70 bg-white/10 rounded-full text-base font-semibold inline-block">
      Free Trial Session
    </div>
    <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">
      Connect <span className="text-white/80">1:1</span> with Top Industry Experts for <span className="text-white/80">FREE!</span>
    </h2>
    <p className="text-gray-400 mb-6 text-lg">
      Your personalized mentorship journey starts here. Submit a query and get matched with a mentor to guide you towards your dream career.
    </p>
    <Link to="/mentorship-query">
      <Button className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-2 rounded-full mt-2 border border-white/20">
        Submit Your Query Now
      </Button>
    </Link>
    <div className="mt-5 text-gray-400 flex items-center justify-center gap-2">
      <span role="img" aria-label="users" className="text-2xl">👥</span>
      5860 Peers already submitted
    </div>
  </div>

  <div className="flex flex-wrap justify-center gap-6 mt-12 max-w-4xl mx-auto">
    {mentors.map((m, i) => (
      <div
        key={i}
        className="bg-black/80 border border-white/10 rounded-2xl shadow-[0_10px_25px_rgba(255,255,255,0.05),0_0_10px_rgba(0,0,0,0.5)] px-7 py-5 w-64 flex flex-col items-start transition-transform duration-500 hover:scale-105 hover:shadow-[0_15px_35px_rgba(255,255,255,0.1),0_0_15px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center mb-3 w-full">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg mr-3 shadow-inner ring-1 ring-white/20">
            {m.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div className="text-white font-semibold text-base">{m.name}</div>
            <div className="text-gray-400 text-xs">{m.role}</div>
          </div>
        </div>
        <div className="mt-1 mb-1 text-white/80 flex items-center text-sm justify-between w-full">
          <span className="mr-2">⭐ {m.rating}</span>
          <span className="text-gray-500 text-xs">{m.exp}</span>
        </div>
      </div>
    ))}
  </div>
</section>


    </div>
  );
};

export default SuccessStory;
