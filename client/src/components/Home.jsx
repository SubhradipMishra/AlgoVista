import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { PlayCircleOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { Collapse } from "antd"; import { FaUserCircle } from "react-icons/fa";
const { Panel } = Collapse;
import { useContext } from "react";
import Context from "../util/context";
const typingCode = [
  "// Example: Quick Sort",
  "function quickSort(arr) {",
  "  if (arr.length < 2) return arr;",
  "  const pivot = arr[0];",
  "  const left = arr.filter(x => x < pivot);",
  "  const right = arr.filter(x => x > pivot);",
  "  return [...quickSort(left), pivot, ...quickSort(right)];",
  "}",
];

const featureTabs = [
  {
    title: "Algo Visualizer",
    icon: "ðŸ–¥ï¸",
    cards: [
      { icon: "ðŸ–¥ï¸", title: "Striverâ€™s DSA Sheet", description: "Your ultimate guide to mastering DSA with curated questions." },
      { icon: "ðŸ“š", title: "Core DSA Topics", description: "Simplify complex concepts with a structured and focused approach." },
      { icon: "ðŸ“", title: "Problem-Solving Made Easy", description: "Solve a variety of problems to sharpen your skills and prepare for interviews." },
    ],
  },
  {
    title: "Core Subjects",
    icon: "ðŸ“š",
    cards: [
      { icon: "ðŸ“š", title: "Data Structures", description: "Master Arrays, Linked Lists, Trees, Graphs and more." },
      { icon: "âš™ï¸", title: "System Design", description: "Learn scalable and efficient architecture concepts." },
    ],
  },
  {
    title: "Interview Experience",
    icon: "ðŸ’¬",
    cards: [
      { icon: "ðŸ’¬", title: "Real Interviews", description: "Read and learn from developers' real-world interview journeys." },
    ],
  },
  {
    title: "Practice Problems",
    icon: "ðŸ“",
    cards: [
      { icon: "ðŸ“", title: "Curated Problems", description: "Solve problems that enhance your skills and prepare you for interviews." },
    ],
  },
];

const testimonials = [
  {
    name: "Aarav Patel",
    role: "SDE Intern",
    review: "The visual breakdowns finally made graph and DP problems click for me.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    name: "Neha Sharma",
    role: "Frontend Engineer",
    review: "I stopped memorizing patterns and started understanding why each step works.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    name: "Rohan Mehta",
    role: "Backend Developer",
    review: "The guided practice flow made interview prep feel structured instead of chaotic.",
    rating: 4,
    avatar: "https://i.pravatar.cc/100?img=14",
  },
  {
    name: "Priya Nair",
    role: "CS Student",
    review: "The roadmap and mentor-first approach kept me consistent for the first time.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?img=44",
  },
  {
    name: "Kabir Singh",
    role: "Full Stack Learner",
    review: "I loved how the UI feels like a developer workspace instead of a boring course page.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?img=25",
  },
  {
    name: "Isha Verma",
    role: "Placement Candidate",
    review: "The platform helped me turn weak topics into repeatable practice before interviews.",
    rating: 4,
    avatar: "https://i.pravatar.cc/100?img=47",
  },
];

const testimonialColumns = [
  testimonials.slice(0, 3),
  testimonials.slice(3),
];

const footerNavigation = [
  { label: "Roadmaps", to: "/roadmaps" },
  { label: "Problems", to: "/problems" },
  { label: "Mentorship", to: "/mentorship" },
  { label: "Dev Tools", to: "/devtools" },
];

const footerResources = [
  { label: "Student Reviews", href: "#reviews" },
  { label: "Community", href: "#community" },
  { label: "Learning Roadmap", href: "#roadmap" },
  { label: "FAQ", href: "#faq" },
];

const revealUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [startCount, setStartCount] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true });
  const [openDropdown, setOpenDropdown] = useState(null);
  const { session, setSession } = useContext(Context);
  const [profileOpen, setProfileOpen] = useState(false);

  // Scroll effect
  useEffect(() => {

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setSession(null);
      setProfileOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Start count when in view
  useEffect(() => {
    if (inView) setStartCount(true);
  }, [inView]);

  // Static code for terminal
  const staticLines = typingCode;

  return (
    <motion.div
      className="page-shell min-h-screen flex flex-col text-gray-200 overflow-x-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[rgba(0,255,136,0.06)] blur-3xl" />
        <div className="absolute right-[-10rem] top-[32rem] h-96 w-96 rounded-full bg-[rgba(0,255,136,0.04)] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-[rgba(0,255,136,0.03)] blur-3xl" />
      </div>
      {/* Navbar */}


      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 font-mono
    ${isScrolled ? "glass-panel py-3" : "bg-transparent py-5"}
  `}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8">
          {/* Logo */}
          <h1 className="text-3xl font-bold tracking-widest text-gray-100 uppercase">
            AlgoVista
          </h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center text-base font-semibold relative text-gray-300">
            <Link
              to="/"
              className="relative hover-tech-yellow transition-all group"
            >
              Home
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[#FF8A00] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-[#FF6B00] transition-all">
                Resources <span className="ml-1 group-hover:rotate-180 transition-transform">â–¼</span>
              </button>
              <div className="absolute left-0 mt-3 w-60 glass-card opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-300">
                <div className="p-3 space-y-2">
                  {[{ name: "SDE Sheet", icon: "ðŸ“" }, { name: "System Design", icon: "âš™ï¸" }, { name: "Core Subjects", icon: "ðŸ“š" }, { name: "Interview Story", icon: "ðŸ’¬" }].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
                      <span>{item.icon}</span> <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/roadmaps" className="relative hover-tech-yellow transition-all group">
              Roadmap
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[#FF8A00] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/problems" className="relative hover-tech-yellow transition-all group">
              Problems
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[#FF8A00] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/mentorship" className="relative hover-tech-yellow transition-all group">
              Mentorship
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[#FF8A00] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="success-stories" className="relative hover-tech-yellow transition-all group">
              Success Stories
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[#FF8A00] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="devtools" className="relative hover-tech-yellow transition-all group">
              Dev Tools
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-[#FF8A00] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* USER SESSION */}
            {session ? (
              <div className="relative group">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/70 border border-gray-700 hover:border-gray-500 cursor-pointer transition-all">
                  <FaUserCircle size={26} className="text-gray-300" />
                  <div className="leading-tight">
                    <span className="font-semibold text-gray-100 text-sm">{session.fullname}</span>
                    <span className="block text-xs text-gray-500">{session.email?.split("@")[0]}</span>
                  </div>
                  <span className="ml-2 text-gray-500 group-hover:text-gray-300 transition-transform group-hover:rotate-180">â–¼</span>
                </div>

                <div className="absolute right-0 mt-3 w-64 bg-black border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible scale-95 group-hover:scale-100 transition-all">
                  <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-3 bg-gray-900/40">
                    <FaUserCircle className="text-gray-300 text-2xl" />
                    <div>
                      <p className="font-semibold text-gray-100 text-sm">{session.fullname}</p>
                      <p className="text-xs text-gray-500 truncate">{session.email}</p>
                    </div>
                  </div>

                  <ul className="py-2">
                    <li>
                      <Link
                        to={session.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                        className="flex items-center gap-3 px-5 py-2 text-gray-300 hover:bg-gray-800"
                      >
                        ðŸ“Š Dashboard
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-5 py-2 text-left text-red-400 hover:bg-red-900/20"
                      >
                        ðŸšª Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login"><button className="btn-outline text-sm py-1.5 px-4">Login</button></Link>
                <Link to="/signup"><button className="btn-yellow text-sm py-1.5 px-4">Sign Up</button></Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-300 text-2xl">
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden glass-card w-full absolute top-full left-0 flex flex-col items-center py-6 space-y-4 animate-slide-down text-[var(--text-main)] font-mono border-t-0 mt-2">
            {[
              { name: "Home", link: "/" },
              { name: "Resources", link: "/resources" },
              { name: "Roadmap", link: "/roadmaps" },
              { name: "Problems", link: "/problems" },
              { name: "Devtools", link: "/devtools" }
            ].map((item, i) => (
              <Link
                key={i}
                to={item.link}
                onClick={() => setMenuOpen(false)}
                className="text-lg hover:text-[var(--primary-yellow)] transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {session ? (
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600/80 text-white rounded-md w-32 hover:bg-red-500 transition-colors">Logout</button>
            ) : (
              <div className="flex flex-col gap-3 w-32 mt-4">
                <Link to="/login" className="w-full"><button className="btn-outline w-full py-2">Login</button></Link>
                <Link to="/signup" className="w-full"><button className="btn-yellow w-full py-2">Sign Up</button></Link>
              </div>
            )}
          </div>
        )}
      </nav>



      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 sm:px-8 py-32 md:py-44 mt-16 overflow-hidden">

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

        {/* Green Glow Orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgba(0,255,136,0.06)] rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[rgba(0,255,136,0.04)] rounded-full blur-[120px] pointer-events-none animate-bloat-slow"></div>
        <div className="absolute top-1/3 left-[-5%] w-[300px] h-[300px] bg-[rgba(0,255,136,0.03)] rounded-full blur-[100px] pointer-events-none animate-bloat-slower"></div>

        {/* Scan Line Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent animate-scan-line"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--glass-border)] bg-[rgba(0,0,0,0.5)] backdrop-blur-md text-sm font-mono mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
            </span>
            <span className="text-[var(--primary)]">Platform Active</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">12,000+ developers learning</span>
          </motion.div>

          {/* Main Heading — Static, Centered */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-white">Master the</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-emerald-400 to-teal-300 animate-text-glow">
              Art of Code
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Visualize algorithms, solve curated problems, and prepare for interviews
            with step-by-step guidance from industry mentors.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/problems"
              className="btn-yellow font-mono text-base px-8 py-4 rounded-xl"
            >
              Start Coding →
            </Link>
            <Link
              to="/roadmaps"
              className="btn-outline font-mono text-base px-8 py-4 rounded-xl"
            >
              Explore Roadmaps
            </Link>
          </motion.div>

          {/* Terminal Preview — Below Hero, Centered */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="glass-card overflow-hidden rounded-2xl border border-[var(--glass-border)] shadow-[0_0_60px_rgba(0,255,136,0.08)] bg-[#060606]/90 backdrop-blur-md">
              {/* Terminal Header */}
              <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="mx-auto text-xs text-gray-600 font-mono tracking-wider">algovista — terminal</div>
              </div>
              {/* Terminal Body */}
              <div className="p-6 font-mono text-sm leading-7 text-gray-400">
                <div className="text-[var(--primary)] mb-1"><span className="text-gray-600">$</span> ./init_algovista.sh</div>
                <div className="text-gray-500 mb-1">[✓] Loading data structures...</div>
                <div className="text-gray-500 mb-1">[✓] Compiling system design modules...</div>
                <div className="text-gray-500 mb-3">[✓] Connecting to mentor network...</div>
                {staticLines.map((line, index) => {
                  const safeLine = typeof line === "string" ? line : "";
                  return (
                    <div key={index}>
                      {safeLine.includes("//") ? <span className="text-gray-600">{safeLine}</span> :
                        safeLine.includes("function") || safeLine.includes("return") ? <span className="text-purple-400">{safeLine}</span> :
                          <span className="text-gray-300">{safeLine}</span>}
                    </div>
                  );
                })}
                <div className="mt-2 text-[var(--primary)] animate-pulse">█</div>
              </div>
            </div>
          </motion.div>

        </div>

      </section>








      {/* Stats Section */}
      <section
        ref={ref}
        className="relative py-24 grid-bg text-gray-200 overflow-hidden font-mono"
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">

          {/* Title */}
          <h2 className="text-5xl font-extrabold text-center text-[var(--primary-yellow)] mb-20 tracking-wide 
      animate-text-glow drop-shadow-[0_0_15px_rgba(255,107,0,0.3)]">
            Stats That Define AlgoVista
          </h2>


          <div className="glass-card w-full py-8 md:py-12 px-6 flex flex-col md:flex-row justify-around items-center divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)] border border-[var(--primary-yellow)] shadow-[0_0_20px_rgba(255,107,0,0.1)]">
            {[
              { label: "Active Users", value: 12000 },
              { label: "Algorithms Visualized", value: 480 },
              { label: "Live Sessions", value: 85 }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="group relative px-8 py-6 flex flex-col items-center justify-center w-full md:w-1/3 hover:bg-[rgba(255,107,0,0.02)] transition-colors duration-300"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                {/* Value */}
                <div className="relative z-10 text-center">
                  <h3 className="text-4xl sm:text-5xl font-extrabold text-[var(--primary-yellow)] mb-2 font-display">
                    {startCount ? (
                      <CountUp start={0} end={stat.value} duration={2.5} />
                    ) : (
                      0
                    )}
                    +
                  </h3>

                  {/* Label */}
                  <p className="text-gray-400 font-semibold text-sm md:text-base tracking-widest uppercase mt-2">
                    &gt; {stat.label} _
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Features Section */}
      <motion.section
        className="relative overflow-hidden grid-bg py-24 font-mono text-gray-200"
        id="features"
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="absolute left-0 top-24 h-64 w-64 rounded-full bg-[rgba(255,107,0,0.08)] blur-3xl pointer-events-none"></div>
        <div className="absolute right-[-6rem] bottom-8 h-72 w-72 rounded-full bg-[rgba(255,69,0,0.08)] blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="section-kicker mb-4">Learning engine</div>
              <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">
                Revolutionize the Way You Learn
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
                Move from passive reading to visual understanding. Each track is designed to feel like a focused developer workspace, not a generic course catalog.
              </p>
            </div>

            <div className="feature-panel rounded-[28px] p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary-yellow)]">Active path</p>
              <p className="mt-3 text-2xl font-bold text-white">{featureTabs[activeTab].title}</p>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                Switch tracks to reveal curated cards for practice, concepts, and real interview momentum.
              </p>
            </div>
          </div>

          <div className="mb-12 flex flex-wrap justify-center gap-3 sm:gap-4">
            {featureTabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-300 border ${activeTab === index
                    ? "border-[var(--primary-yellow)] bg-[linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,69,0,0.12))] text-[var(--primary-yellow)] shadow-[0_0_24px_rgba(255,107,0,0.16)]"
                    : "border-[var(--glass-border)] bg-black/30 text-gray-300 hover:border-[var(--primary-yellow)] hover:text-[var(--primary-yellow)]"
                  }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featureTabs[activeTab].cards?.map((card, i) => (
              <motion.div
                key={i}
                className="feature-card group relative overflow-hidden rounded-[28px] p-7 sm:p-8"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary-yellow)] to-transparent opacity-70"></div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    {card.icon}
                  </div>
                  <span className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-gray-500">
                    Module 0{i + 1}
                  </span>
                </div>

                <h3 className="mb-3 text-2xl font-bold text-white">{card.title}</h3>
                <p className="mb-8 text-sm leading-7 text-gray-400">{card.description}</p>

                <div className="flex items-center justify-between">
                  <button className="text-[var(--primary-yellow)] font-semibold transition group-hover:translate-x-1">
                    Launch Track
                  </button>
                  <span className="text-xs uppercase tracking-[0.24em] text-gray-600">Ready</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* REVIEW SECTION */}

      <motion.section
        id="reviews"
        className="relative py-24 grid-bg text-[var(--text-main)] overflow-hidden font-mono"
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="mb-12 max-w-2xl"
            variants={revealUp}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[rgba(255,107,0,0.08)] px-4 py-2 text-xs uppercase tracking-[0.32em] text-[var(--primary-yellow)]">
              Live feedback lane
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--primary-yellow)] animate-text-glow tracking-wide drop-shadow-[0_0_15px_rgba(255,107,0,0.25)]">
              What Our Students Say
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-400">
              The review section now fades in and uses opposite vertical motion so the page feels more alive without turning noisy.
            </p>
          </motion.div>

          <div className="grid items-start gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <motion.div
              className="glass-card relative overflow-hidden rounded-[28px] p-8"
              variants={revealUp}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary-yellow)] to-transparent opacity-60" />
              <p className="text-sm uppercase tracking-[0.28em] text-gray-500">Trust signal</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--glass-border)] bg-black/30 p-4">
                  <p className="text-3xl font-bold text-[var(--primary-yellow)]">10k+</p>
                  <p className="mt-2 text-sm text-gray-400">Learners exploring structured prep every month.</p>
                </div>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-black/30 p-4">
                  <p className="text-3xl font-bold text-[var(--primary-yellow)]">4.9/5</p>
                  <p className="mt-2 text-sm text-gray-400">Average satisfaction from guided DSA learning paths.</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-[var(--glass-border)] bg-[linear-gradient(145deg,rgba(255,107,0,0.1),rgba(255,255,255,0.03))] p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-gray-500">Why it works</p>
                <p className="mt-4 text-lg leading-8 text-gray-200">
                  AlgoVista blends visual intuition, curated practice, and mentor-backed structure so progress feels visible every week.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="testimonial-fade grid h-[34rem] gap-6 overflow-hidden rounded-[32px] md:h-[40rem] md:grid-cols-2"
              variants={revealUp}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {testimonialColumns.map((column, columnIndex) => (
                <motion.div
                  key={columnIndex}
                  className="flex flex-col gap-6"
                  animate={columnIndex === 0 ? { y: ["0%", "-50%"] } : { y: ["-50%", "0%"] }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: columnIndex === 0 ? 18 : 20,
                    ease: "linear",
                  }}
                >
                  {[...column, ...column].map((review, i) => (
                    <div
                      key={`${review.name}-${i}`}
                      className="glass-card flex min-h-[16rem] flex-col justify-between rounded-[28px] p-6"
                    >
                      <div>
                        <div className="mb-5 flex items-center gap-4">
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="h-14 w-14 rounded-2xl border border-[var(--glass-border)] object-cover shadow-[0_0_16px_rgba(255,107,0,0.12)]"
                          />
                          <div>
                            <h3 className="text-base font-semibold text-gray-100">{review.name}</h3>
                            <p className="text-sm text-gray-400">{review.role}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-7 text-gray-300">"{review.review}"</p>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, idx) => (
                            <FaStar key={idx} className="text-[var(--primary-yellow)] drop-shadow-[0_0_5px_rgba(255,107,0,0.5)]" />
                          ))}
                          {[...Array(5 - review.rating)].map((_, idx) => (
                            <FaStar key={idx} className="text-gray-600" />
                          ))}
                        </div>
                        <span className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-gray-500">
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Background subtle bubbles */}
        <div className="absolute top-10 left-0 w-32 h-32 bg-white/10 rounded-full animate-bloat-slow blur-xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-0 w-40 h-40 bg-white/10 rounded-full animate-bloat-slow blur-2xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-white/5 rounded-full animate-bloat-slower blur-xl pointer-events-none"></div>
      </motion.section>



      {/* FIX SECTION */}
      <section className="relative py-28 text-[var(--text-main)] overflow-hidden font-mono grid-bg" id="solutions">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="section-kicker mb-4">Pain to progress</div>
              <h2 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
                AlgoVista Has You Covered
              </h2>
            </div>

            <div className="feature-panel rounded-[28px] p-6">
              <p className="text-sm leading-7 text-gray-300">
                Every learner gets stuck somewhere: visual intuition, problem application, structure, or consistency. This section now reads like a guided diagnosis with a clear path forward.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {[
              {
                emoji: "ðŸ˜©",
                problem: "I canâ€™t visualize how algorithms actually work.",
                solution:
                  "AlgoVista transforms code into step-by-step animations so you can watch every iteration, comparison, and swap in real-time.",
              },
              {
                emoji: "ðŸ˜•",
                problem: "I know the concepts but canâ€™t apply them to problems.",
                solution:
                  "Learn by doing! Each visualization is paired with interactive coding challenges that help you connect theory with implementation.",
              },
              {
                emoji: "ðŸ˜”",
                problem: "Preparing for interviews feels confusing and unstructured.",
                solution:
                  "AlgoVista gives you curated roadmaps, SDE sheets, and topic-wise progress tracking to keep your prep focused and efficient.",
              },
              {
                emoji: "ðŸ˜“",
                problem: "Itâ€™s hard to stay consistent while learning alone.",
                solution:
                  "With streak tracking, leaderboards, and a friendly community, AlgoVista keeps your motivation high and progress measurable.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="solution-row grid gap-5 rounded-[28px] p-6 md:grid-cols-[0.72fr_1.28fr] md:items-stretch"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <div className="rounded-[24px] border border-[var(--glass-border)] bg-black/30 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-gray-500">
                      Challenge 0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">The Problem</h3>
                  <p className="mt-4 text-base leading-8 text-gray-300">{item.problem}</p>
                </div>

                <div className="rounded-[24px] border border-[rgba(255,107,0,0.22)] bg-[linear-gradient(145deg,rgba(255,107,0,0.08),rgba(255,255,255,0.03))] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-[var(--primary-yellow)] shadow-[0_0_12px_rgba(255,107,0,0.8)]"></span>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--primary-yellow)]">
                      AlgoVista Solution
                    </h4>
                  </div>
                  <p className="text-base leading-8 text-gray-200">{item.solution}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <style>
          {`
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.35; transform: scale(1.05); }
      }
      .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
    `}
        </style>
      </section>


      {/* COMMUNITY SECTION */}

      <section
        id="community"
        className="relative py-28 text-[var(--text-main)] overflow-hidden grid-bg font-mono"
      >
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {/* Heading */}
          <h2 className="text-5xl font-extrabold mb-6 text-[var(--primary-yellow)] animate-text-glow drop-shadow-[0_0_15px_rgba(255,107,0,0.25)]">
            Join The AlgoVista Community
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg leading-relaxed">
            Learn. Share. Grow. <span className="font-semibold text-gray-100">AlgoVista</span> isnâ€™t
            just a platform â€” itâ€™s a home for passionate learners, problem solvers, and future tech
            leaders. Connect with peers, participate in challenges, and level up together.
          </p>

          {/* Community Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "ðŸ¤ Peer Learning",
                desc: "Connect with students and developers who share your passion for DSA and development.",
              },
              {
                title: "ðŸ† Challenges & Leaderboards",
                desc: "Compete in weekly challenges, earn points, and climb the ranks while learning.",
              },
              {
                title: "ðŸ’¬ Interview Stories",
                desc: "Read and share real experiences from tech interviews to learn smart strategies.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-8 glass-card hover:border-[var(--primary-yellow)] hover:shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:-translate-y-2 transition-all duration-500"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-100 relative z-10">{item.title}</h3>
                <p className="text-gray-400 relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Community Members */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-20">
            {[1, 2, 3, 4, 5].map((num) => (
              <img
                key={num}
                src={`https://randomuser.me/api/portraits/${num % 2 === 0 ? "men" : "women"}/${num + 20}.jpg`}
                alt="community user"
                className="w-16 h-16 rounded-full border-2 border-gray-500 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform duration-500"
              />
            ))}
            <span className="text-gray-500 text-lg ml-3">
              +10,000 learners already connected
            </span>
          </div>

          {/* CTA */}
          <div className="mt-16">
            <button className="btn-yellow font-mono text-lg px-8 py-4 shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:shadow-[0_0_30px_rgba(255,107,0,0.4)] transition-all duration-500">
              &gt; Join The Community Now _
            </button>
          </div>
        </div>

        {/* Floating Background Shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gray-700 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gray-800 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>

        <style>
          {`
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.1; transform: scale(1); }
        50% { opacity: 0.2; transform: scale(1.05); }
      }
      .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
    `}
        </style>
      </section>




      {/* INSTURCTOR SECTION */}
      <section
        id="instructors"
        className="relative py-28 text-[var(--text-main)] overflow-hidden grid-bg font-mono"
      >
        {/* Background softly blurred circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#FF6B00]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          {/* Heading */}
          <h2 className="text-5xl font-extrabold mb-6 text-[var(--primary-yellow)] animate-text-glow drop-shadow-[0_0_15px_rgba(255,107,0,0.25)]">
            Meet Our Mentors
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg leading-relaxed">
            Learn from experienced <span className="font-semibold text-gray-100">Instructors</span> and{" "}
            <span className="font-semibold text-gray-300">Industry Mentors</span>
            who guide you through every algorithm, concept, and problem-solving approach.
          </p>

          {/* Founder Card */}
          <div className="flex justify-center mb-16">
            <div className="w-full sm:w-[400px]">
              <div className="glass-card hover:border-[var(--primary-yellow)] hover:shadow-[0_0_25px_rgba(255,107,0,0.2)] hover:-translate-y-2 transition-all duration-500 p-6 text-left">
                <div className="flex items-center gap-5">
                  <img
                    src="/images/me2.jpg" // replace with your real image
                    alt="Founder"
                    className="w-24 h-24 rounded-xl object-cover border border-gray-500"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-100">Subhradip Mishra</h3>
                    <p className="text-sm text-gray-400 font-medium">
                      Founder & Full Stack Developer
                    </p>
                    <p className="text-xs text-gray-500">
                      Java â€¢ DevOps â€¢ Cloud â€¢ DSA Instructor
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-gray-300 leading-relaxed italic">
                  "Building AlgoVista to empower students with real-world coding and algorithmic understanding."
                </p>
              </div>
            </div>
          </div>

          {/* Mentor Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "Arjun Mehta",
                role: "Senior Software Engineer â€¢ Google",
                img: "https://randomuser.me/api/portraits/men/75.jpg",
                quote: "Teaching DSA is not about syntax â€” itâ€™s about clarity of logic and flow of thought.",
              },
              {
                name: "Priya Sharma",
                role: "Algorithm Mentor â€¢ Ex-Amazon",
                img: "https://randomuser.me/api/portraits/women/65.jpg",
                quote: "I believe anyone can master problem-solving with the right visualization tools.",
              },
              {
                name: "Rohit Patel",
                role: "Instructor â€¢ AlgoVista Core Team",
                img: "https://randomuser.me/api/portraits/men/64.jpg",
                quote: "Breaking down complex algorithms into visual steps is where true learning begins.",
              },
            ].map((mentor, i) => (
              <div
                key={i}
                className="p-8 rounded-xl border border-gray-700 bg-gray-900/70 hover:border-gray-500 hover:shadow-md transition-all duration-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-xl overflow-hidden mb-6 shadow-sm">
                    <img
                      src={mentor.img}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-100 mb-1">{mentor.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{mentor.role}</p>
                  <p className="text-gray-300 italic text-sm leading-relaxed">{`"${mentor.quote}"`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ROADMAP */}

      <section
        id="roadmap"
        className="relative py-28 text-[var(--text-main)] overflow-hidden grid-bg font-mono"
      >
        {/* Background floating bubbles */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gray-700/20 rounded-full blur-3xl animate-bloat-slow"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gray-800/20 rounded-full blur-3xl animate-bloat-slower"></div>
        <div className="absolute bottom-10 left-1/4 w-28 h-28 bg-gray-600/20 rounded-full blur-3xl animate-bloat-slow"></div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {/* Heading */}
          <h2 className="text-5xl font-extrabold mb-6 text-[var(--primary-yellow)] animate-text-glow drop-shadow-[0_0_15px_rgba(255,107,0,0.25)]">
            Your Learning Roadmap
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg leading-relaxed">
            Choose your path and master your skills. Each roadmap is designed to guide you from basics to mastery.
          </p>

          {/* Roadmap Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: "DSA",
                desc: "Master data structures, algorithms, and problem-solving skills for coding interviews.",
                preparedBy: "Prepared by AlgoVista Core Team",
                difficulty: "Intermediate",
                modules: 12,
                learners: 2400,
              },
              {
                title: "MERN Stack",
                desc: "Learn full-stack JavaScript development using MongoDB, Express, React, and Node.js.",
                preparedBy: "Prepared by Subhradip Mishra",
                difficulty: "Advanced",
                modules: 18,
                learners: 3200,
              },
              {
                title: "Fullstack Developer",
                desc: "Become a versatile developer by learning front-end and back-end technologies.",
                preparedBy: "Prepared by AlgoVista Mentors",
                difficulty: "Beginner",
                modules: 10,
                learners: 1800,
              },
              {
                title: "DevOps",
                desc: "Learn CI/CD, Docker, Kubernetes, AWS, and automate software deployments.",
                preparedBy: "Prepared by Subhradip Mishra",
                difficulty: "Advanced",
                modules: 15,
                learners: 2100,
              },
              {
                title: "Java Developer",
                desc: "Master Java programming, Spring Boot, and enterprise-level application development.",
                preparedBy: "Prepared by AlgoVista Mentors",
                difficulty: "Intermediate",
                modules: 14,
                learners: 2700,
              },
            ].map((item, i) => {
              const difficultyColors = {
                Beginner: "bg-gray-700/20 text-gray-400 border-gray-500",
                Intermediate: "bg-gray-700/20 text-gray-400 border-gray-500",
                Advanced: "bg-gray-700/20 text-gray-400 border-gray-500",
              };

              return (
                <div
                  key={i}
                  className="glass-card hover:border-[var(--primary-yellow)] hover:shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between p-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-100">{item.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[item.difficulty]}`}
                      >
                        {item.difficulty}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">{item.desc}</p>
                    <p className="text-gray-400 italic text-xs mb-3">{item.preparedBy}</p>

                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-300">ðŸ“š {item.modules} Modules</span>
                      <span className="text-gray-400">ðŸ‘¥ {item.learners} Learners</span>
                    </div>
                  </div>

                  <button className="mt-6 w-full btn-outline hover-tech-yellow py-2 rounded-lg transition-all duration-300">
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bubble animations */}
        <style>
          {`
      @keyframes bloat {
        0%, 100% { transform: scale(1); opacity: 0.1; }
        50% { transform: scale(1.05); opacity: 0.2; }
      }
      .animate-bloat-slow { animation: bloat 10s infinite ease-in-out; }
      .animate-bloat-slower { animation: bloat 14s infinite ease-in-out; }
    `}
        </style>
      </section>



      <section id="career-section" className="w-full text-[var(--text-main)] py-24 px-6 font-mono grid-bg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12 items-center">

          {/* ==== LEFT CONTENT ONLY ==== */}
          <div>
            <h2 className="text-5xl font-extrabold text-gray-100 leading-tight">
              Unlock Your Career Potential with{" "}
              <span className="text-gray-300">Our Expert Guidance</span>
            </h2>

            <p className="text-gray-400 mt-6 text-lg leading-relaxed max-w-2xl">
              We provide structured guidance, mentoring, and personalized learning paths
              to help you become industry-ready and secure high-paying tech roles.
            </p>

            <ul className="mt-10 space-y-5 text-gray-300 text-lg">
              {[
                "Personalized mentorship to guide your career path",
                "Career resources & industry insights",
                "Hands-on learning and real-world project experience",
                "Connect with a strong global alumni network",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 hover:text-gray-100 transition"
                >
                  <span className="text-gray-400 text-2xl">âœ”</span> {item}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button className="mt-10 btn-yellow px-8 py-4 flex items-center gap-2">
              Start Learning ðŸš€
            </button>
          </div>
        </div>
      </section>




      {/* FREQENUTLY SECTION */}

      <section
        id="faq"
        className="relative py-24 text-[var(--text-main)] overflow-hidden grid-bg font-mono"
      >
        {/* Background bubbles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gray-700/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-800/20 rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Heading */}
          <h2 className="text-5xl font-extrabold text-center mb-10 text-[var(--primary-yellow)] animate-text-glow drop-shadow-[0_0_15px_rgba(255,107,0,0.25)]">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto text-sm leading-relaxed">
            Everything you need to know about <span className="font-semibold text-gray-100">AlgoVista</span> and how it helps you master your tech journey.
          </p>

          {/* FAQ Boxes */}
          {[
            {
              question: "What is AlgoVista?",
              answer: "AlgoVista is your all-in-one learning hub for mastering DSA, Full Stack Development, DevOps, and Java â€” designed for students who want to learn smartly with visualized explanations."
            },
            {
              question: "Is AlgoVista free to use?",
              answer: "Yes! Most of the core content is free. You can start learning anytime. Advanced mentorship, guided projects, and certifications are part of premium access."
            },
            {
              question: "Who are the instructors?",
              answer: "All mentors are experienced developers from top tech backgrounds â€” led by Subhradip Mishra, Founder of AlgoVista, Full Stack & DevOps Engineer, and DSA Instructor."
            },
            {
              question: "How do I start learning?",
              answer: "Simply pick your roadmap â€” DSA, MERN, Full Stack, or DevOps â€” and click â€˜Get Startedâ€™. AlgoVista will guide you step-by-step through interactive modules."
            },
            {
              question: "Will I receive a certificate?",
              answer: "Yes, youâ€™ll receive a verified completion certificate for finishing roadmaps or solving structured DSA challenges."
            }
          ].map((faq, i) => {
            const [open, setOpen] = React.useState(false);
            return (
              <div
                key={i}
                onClick={() => setOpen(!open)}
                className={`cursor-pointer mb-6 glass-card p-6 transition-all duration-500 hover:border-[var(--primary-yellow)] hover:shadow-[0_0_20px_rgba(255,107,0,0.1)] ${open ? "border-[var(--primary-yellow)]" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-100">{faq.question}</h3>
                  <span className={`text-2xl font-bold text-gray-400 transition-transform duration-500 ${open ? "rotate-180" : ""}`}>
                    {open ? "âˆ’" : "+"}
                  </span>
                </div>

                <div className={`transition-all duration-700 overflow-hidden text-gray-400 mt-3 text-sm leading-relaxed ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bubble animations */}
        <style>
          {`
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.1; transform: scale(1); }
        50% { opacity: 0.2; transform: scale(1.05); }
      }
      .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
    `}
        </style>
      </section>



      {/* ðŸŒ Get in Touch Section */}
      <section className="w-full py-24 px-6 relative overflow-hidden font-mono grid-bg border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT: Form */}
          <div className="text-left space-y-6 ">
            <h2 className="text-5xl font-extrabold text-[var(--primary-yellow)] animate-text-glow leading-tight drop-shadow-[0_0_15px_rgba(255,107,0,0.25)]">
              Reach Out{" "}
              <span className="text-gray-300 text-shadow-none">Today</span>
            </h2>
            <p className="text-gray-400">
              Have a question or want to discuss your learning path? Weâ€™re here to assist you.
            </p>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Enter your full name"
                className="col-span-1 md:col-span-2 p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)]"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)]"
              />
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)]"
              />
              <input
                type="text"
                placeholder="What's this about?"
                className="p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)]"
              />

              <textarea
                rows="4"
                placeholder="Tell us more about your inquiry..."
                className="col-span-1 md:col-span-2 p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)]"
              ></textarea>

              <button
                type="submit"
                className="col-span-1 md:col-span-2 btn-yellow py-3 flex items-center justify-center gap-2 transition"
              >
                Send Message
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

          {/* RIGHT SECTION */}
          <div className="relative flex justify-center lg:justify-end grid-bg">

            {/* Soft Glowing Background */}
            <div className="absolute -z-10 w-72 h-72 bg-gray-700 blur-[100px] opacity-20 rounded-full"></div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-gray-700 shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-100">We are online now</span>
            </div>

            {/* Image */}
            <img
              src="https://coderarmy.in/assets/images/webp/contactmewebp.jpg"
              alt="Contact Illustration"
              className="w-80 h-80 object-contain rounded-lg shadow-[0_0_25px_rgba(255,107,0,0.15)] hover:shadow-[0_0_35px_rgba(255,107,0,0.3)] hover:scale-105 transition duration-300"
            />
          </div>

        </div>
      </section>







      <motion.footer
        className="footer-shell relative mt-8 border-t border-[var(--glass-border)] text-[var(--text-main)] font-mono"
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.1),transparent_42%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="footer-hero mb-10 grid gap-8 rounded-[32px] p-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--primary-yellow)]">Build momentum</p>
              <h3 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight text-white">
                Keep your prep focused with guided roadmaps, visual explainers, and a calmer interface.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
                The page now lands softer, the testimonial wall feels more alive, and the footer closes with a stronger product story.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/signup" className="btn-yellow flex items-center justify-center text-center">
                Create Free Account
              </Link>
              <Link to="/roadmaps" className="btn-outline flex items-center justify-center text-center">
                Explore Roadmaps
              </Link>
              <div className="rounded-2xl border border-[var(--glass-border)] bg-black/30 p-4">
                <p className="text-2xl font-bold text-[var(--primary-yellow)]">12000+</p>
                <p className="mt-2 text-sm text-gray-400">Active learners building consistency.</p>
              </div>
              <div className="rounded-2xl border border-[var(--glass-border)] bg-black/30 p-4">
                <p className="text-2xl font-bold text-[var(--primary-yellow)]">480+</p>
                <p className="mt-2 text-sm text-gray-400">Visualized concepts and interview patterns.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <h4 className="text-lg font-semibold text-white">AlgoVista</h4>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                A developer-first learning platform for visual DSA, system design clarity, and better interview preparation.
              </p>
              <div className="mt-6 flex gap-3 text-lg">
                <a href="#" className="glass-card flex h-11 w-11 items-center justify-center rounded-2xl hover-tech-yellow"><FaGithub /></a>
                <a href="#" className="glass-card flex h-11 w-11 items-center justify-center rounded-2xl hover-tech-yellow"><FaLinkedin /></a>
                <a href="#" className="glass-card flex h-11 w-11 items-center justify-center rounded-2xl hover-tech-yellow"><FaTwitter /></a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-gray-500">Navigation</h4>
              <div className="mt-4 space-y-3 text-sm">
                {footerNavigation.map((item) => (
                  <Link key={item.label} to={item.to} className="block text-gray-300 transition hover:text-[var(--primary-yellow)]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-gray-500">On This Page</h4>
              <div className="mt-4 space-y-3 text-sm">
                {footerResources.map((item) => (
                  <a key={item.label} href={item.href} className="block text-gray-300 transition hover:text-[var(--primary-yellow)]">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-gray-500">Contact</h4>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <p>Bengaluru, India</p>
                <p>support@algovista.dev</p>
                <p>Mon - Sat / 10:00 - 19:00 IST</p>
              </div>
              <div className="mt-6 rounded-2xl border border-[var(--glass-border)] bg-black/30 p-4 text-sm text-gray-400">
                Need help picking the right track? Start with roadmaps, then move into guided problem sets.
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[var(--glass-border)] pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <p>(c) {new Date().getFullYear()} AlgoVista. All rights reserved.</p>
            <p>Designed for focused prep, visual clarity, and steady momentum.</p>
          </div>
        </div>
      </motion.footer>



    </motion.div>
  );
};

export default Home;

