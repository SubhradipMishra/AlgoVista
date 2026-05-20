import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { PlayCircleOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaStar, 
  FaUserCircle,
  FaLaptopCode,
  FaBook,
  FaCog,
  FaComments,
  FaFileAlt,
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaQuestionCircle,
  FaTools,
  FaRoad,
  FaFire,
  FaUsers,
  FaTrophy,
  FaBookOpen,
  FaCheckCircle,
  FaRocket,
  FaPlus,
  FaMinus,
  FaArrowRight
} from "react-icons/fa";
import { Collapse } from "antd";
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
    icon: <FaLaptopCode className="text-[var(--primary)]" />,
    cards: [
      { icon: <FaLaptopCode className="text-[var(--primary)]" />, title: "Striver’s DSA Sheet", description: "Your ultimate guide to mastering DSA with curated questions." },
      { icon: <FaBook className="text-[var(--primary)]" />, title: "Core DSA Topics", description: "Simplify complex concepts with a structured and focused approach." },
      { icon: <FaFileAlt className="text-[var(--primary)]" />, title: "Problem-Solving Made Easy", description: "Solve a variety of problems to sharpen your skills and prepare for interviews." },
    ],
  },
  {
    title: "Core Subjects",
    icon: <FaBook className="text-[var(--primary)]" />,
    cards: [
      { icon: <FaBook className="text-[var(--primary)]" />, title: "Data Structures", description: "Master Arrays, Linked Lists, Trees, Graphs and more." },
      { icon: <FaCog className="text-[var(--primary)]" />, title: "System Design", description: "Learn scalable and efficient architecture concepts." },
    ],
  },
  {
    title: "Interview Experience",
    icon: <FaComments className="text-[var(--primary)]" />,
    cards: [
      { icon: <FaComments className="text-[var(--primary)]" />, title: "Real Interviews", description: "Read and learn from developers' real-world interview journeys." },
    ],
  },
  {
    title: "Practice Problems",
    icon: <FaFileAlt className="text-[var(--primary)]" />,
    cards: [
      { icon: <FaFileAlt className="text-[var(--primary)]" />, title: "Curated Problems", description: "Solve problems that enhance your skills and prepare you for interviews." },
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
  { label: "Community", to: "/community" },
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
  const [openFaq, setOpenFaq] = useState(null);
  const [cliInput, setCliInput] = useState("");
  const [cliOutput, setCliOutput] = useState([
    "algovista-cli v2.0.4 - system loaded.",
    "Type 'help' or 'visualize' to run animations."
  ]);

  const handleCliSubmit = (e) => {
    e.preventDefault();
    const cmd = cliInput.trim().toLowerCase();
    if (!cmd) return;

    let response = [];
    if (cmd === "help") {
      response = [
        `$ ${cliInput}`,
        "Available commands:",
        "  - visualize : starts step-by-step bubble sort animation",
        "  - about     : developer-first visual DSA portal details",
        "  - clear     : clears terminal output",
        "  - secret    : reveals easter egg code"
      ];
    } else if (cmd === "visualize") {
      response = [
        `$ ${cliInput}`,
        "Initializing Bubble Sort Visualizer...",
        "[ Array: 5, 2, 8, 1, 9 ]",
        "  Iter 1: [ 2, 5, 1, 8, 9 ] (Comparing 5 & 2, swapped)",
        "  Iter 2: [ 2, 1, 5, 8, 9 ] (Comparing 5 & 1, swapped)",
        "  Iter 3: [ 1, 2, 5, 8, 9 ] (Pass completed, fully sorted!)",
        "✓ Visualized 4 swaps successfully!"
      ];
    } else if (cmd === "about") {
      response = [
        `$ ${cliInput}`,
        "AlgoVista: Created with ❤️ by Subhradip Mishra.",
        "An advanced pedagogical simulator tailored for engineering interviews."
      ];
    } else if (cmd === "secret") {
      response = [
        `$ ${cliInput}`,
        "🔓 GOLDEN PROTOCOL ACTIVATED",
        "const algoVista = { goldTheme: true, premiumAesthetics: 100 };",
        "Keep grinding and preparing, you got this! 🚀"
      ];
    } else if (cmd === "clear") {
      setCliOutput([]);
      setCliInput("");
      return;
    } else {
      response = [
        `$ ${cliInput}`,
        `Command not found: '${cmd}'. Type 'help' for options.`
      ];
    }

    setCliOutput((prev) => [...prev, ...response]);
    setCliInput("");
  };

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
    >      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[rgba(250,204,21,0.06)] blur-3xl" />
        <div className="absolute right-[-10rem] top-[32rem] h-96 w-96 rounded-full bg-[rgba(250,204,21,0.04)] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-[rgba(250,204,21,0.03)] blur-3xl" />
      </div>
      {/* Navbar */}


      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 font-mono
          ${isScrolled
            ? "bg-black/80 backdrop-blur-3xl py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-5"
          }
        `}
      >
        <div className="max-w-[90rem] mx-auto flex items-center justify-between gap-6 px-6 sm:px-8">
          {/* Slick Modern Logo & Icon */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-400 to-[var(--primary)] text-black font-black text-xl shadow-[0_0_20px_rgba(250,204,21,0.35)] group-hover:rotate-6 transition-all duration-300">
              ◈
            </div>
            <h1 className="text-2xl font-black tracking-widest uppercase flex items-center">
              <span className="text-white group-hover:text-gray-200 transition-colors">Algo</span>
              <span className="text-[var(--primary)] ml-1 animate-text-glow font-semibold drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">Vista</span>
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-7 text-sm font-semibold text-gray-300">
            <Link
              to="/"
              className="relative flex h-10 items-center gap-1.5 whitespace-nowrap hover-tech-yellow transition-all group"
            >
              Home
              <span className="absolute left-0 -bottom-1.5 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="flex h-10 items-center gap-1 whitespace-nowrap hover:text-[var(--primary)] transition-all cursor-pointer">
                Resources <FaChevronDown className="ml-1 text-[10px] group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute left-0 mt-3 w-60 rounded-2xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/95 backdrop-blur-2xl shadow-xl opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-300 overflow-hidden">
                <div className="p-3 space-y-1">
                  {[
                    { name: "SDE Sheet", icon: <FaFileAlt className="text-[var(--primary)]" /> },
                    { name: "System Design", icon: <FaCog className="text-[var(--primary)]" /> },
                    { name: "Core Subjects", icon: <FaBook className="text-[var(--primary)]" /> },
                    { name: "Interview Story", icon: <FaComments className="text-[var(--primary)]" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[rgba(250,204,21,0.06)] hover:border-[rgba(250,204,21,0.12)] border border-transparent cursor-pointer transition-all duration-200">
                      {item.icon} <span className="text-gray-300 hover:text-white transition-colors">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/roadmaps" className="relative flex h-10 items-center whitespace-nowrap hover-tech-yellow transition-all group">
              Roadmap
              <span className="absolute left-0 -bottom-1.5 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/problems" className="relative flex h-10 items-center whitespace-nowrap hover-tech-yellow transition-all group">
              Problems
              <span className="absolute left-0 -bottom-1.5 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/mentorship" className="relative flex h-10 items-center whitespace-nowrap hover-tech-yellow transition-all group">
              Mentorship
              <span className="absolute left-0 -bottom-1.5 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/community" className="relative flex h-10 items-center whitespace-nowrap hover-tech-yellow transition-all group">
              Community
              <span className="absolute left-0 -bottom-1.5 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/success-stories" className="relative flex h-10 items-center whitespace-nowrap hover-tech-yellow transition-all group">
              Success Stories
              <span className="absolute left-0 -bottom-1.5 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/devtools" className="relative flex h-10 items-center whitespace-nowrap hover-tech-yellow transition-all group">
              Dev Tools
              <span className="absolute left-0 -bottom-1.5 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-end min-w-[17rem]">
            {session ? (
              <div className="relative group">
                <div className="flex items-center gap-3 rounded-2xl bg-black/60 px-4 py-2 hover:shadow-[0_0_15px_rgba(250,204,21,0.08)] cursor-pointer transition-all duration-350">
                  <FaUserCircle size={24} className="text-[var(--primary)]" />
                  <div className="leading-tight text-left">
                    <span className="block text-xs font-semibold text-gray-100">{session.fullname}</span>
                    <span className="block text-[10px] tracking-tight text-gray-500">{session.email?.split("@")[0]}</span>
                  </div>
                  <FaChevronDown className="ml-1 text-gray-500 group-hover:text-gray-300 transition-transform duration-300 group-hover:rotate-180" size={10} />
                </div>

                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-[rgba(250,204,21,0.15)] bg-black/95 backdrop-blur-2xl shadow-2xl opacity-0 invisible scale-95 transition-all duration-300 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                  <div className="flex items-center gap-3 border-b border-[rgba(250,204,21,0.1)] bg-[rgba(250,204,21,0.02)] px-5 py-3">
                    <FaUserCircle className="text-2xl text-[var(--primary)]" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-100">{session.fullname}</p>
                      <p className="max-w-[170px] truncate text-xs text-gray-500">{session.email}</p>
                    </div>
                  </div>

                  <ul className="py-2">
                    <li>
                      <Link
                        to={session.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                        className="flex items-center gap-3 px-5 py-2.5 text-gray-300 transition-all hover:bg-[rgba(250,204,21,0.05)] hover:text-[var(--primary)]"
                      >
                        <FaTachometerAlt className="text-[var(--primary)]" /> Dashboard
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-red-400 transition-colors hover:bg-red-950/20 cursor-pointer"
                      >
                        <FaSignOutAlt className="text-red-400" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"><button className="btn-outline whitespace-nowrap text-xs py-2 px-5 cursor-pointer">Login</button></Link>
                <Link to="/signup"><button className="btn-yellow whitespace-nowrap text-xs py-2 px-5 cursor-pointer">Sign Up</button></Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-[var(--primary)] text-2xl cursor-pointer">
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden w-full absolute top-full left-0 flex flex-col items-center py-6 space-y-4 animate-slide-down text-gray-200 font-mono border-t border-[rgba(250,204,21,0.15)] bg-black/95 backdrop-blur-3xl shadow-xl mt-2">
            {[
              { name: "Home", link: "/" },
              { name: "Resources", link: "/resources" },
              { name: "Roadmap", link: "/roadmaps" },
              { name: "Problems", link: "/problems" },
              { name: "Community", link: "/community" },
              { name: "Devtools", link: "/devtools" }
            ].map((item, i) => (
              <Link
                key={i}
                to={item.link}
                onClick={() => setMenuOpen(false)}
                className="text-base font-semibold hover:text-[var(--primary)] transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {session ? (
              <button onClick={handleLogout} className="px-5 py-2.5 bg-red-600/80 text-white rounded-xl w-36 hover:bg-red-500 transition-colors cursor-pointer">Logout</button>
            ) : (
              <div className="flex flex-col gap-3 w-36 mt-4">
                <Link to="/login" className="w-full"><button className="btn-outline w-full py-2.5 cursor-pointer">Login</button></Link>
                <Link to="/signup" className="w-full"><button className="btn-yellow w-full py-2.5 cursor-pointer">Sign Up</button></Link>
              </div>
            )}
          </div>
        )}
      </nav>



      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 sm:px-8 py-32 md:py-44 mt-16 overflow-hidden">

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

        {/* Gold Glow Orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgba(250,204,21,0.06)] rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[rgba(250,204,21,0.04)] rounded-full blur-[120px] pointer-events-none animate-bloat-slow"></div>
        <div className="absolute top-1/3 left-[-5%] w-[300px] h-[300px] bg-[rgba(250,204,21,0.03)] rounded-full blur-[100px] pointer-events-none animate-bloat-slower"></div>

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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-amber-400 to-yellow-300 animate-text-glow">
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
            <div className="glass-card overflow-hidden rounded-2xl border border-[var(--glass-border)] shadow-[0_0_60px_rgba(250,204,21,0.08)] bg-[#060606]/90 backdrop-blur-md">
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
        className="relative py-28 text-gray-200 overflow-hidden font-mono"
      >
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[rgba(250,204,21,0.03)] rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Title */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] text-[var(--primary)] mb-4">
              Real-time Impact
            </div>
            <h2 className="text-5xl font-black text-[var(--primary)] tracking-wide animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
              Stats That Define AlgoVista
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm">
              Empowering developers worldwide with advanced visual representations and high-quality preparation materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Active Users", value: 12000, icon: <FaUsers />, suffix: "+" },
              { label: "Algorithms Visualized", value: 480, icon: <FaBookOpen />, suffix: "+" },
              { label: "Live Sessions", value: 85, icon: <FaComments />, suffix: "+" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="group relative rounded-3xl p-8 bg-[#07070a]/80 backdrop-blur-md border border-[rgba(250,204,21,0.12)] hover:border-[var(--primary)] hover:shadow-[0_0_40px_rgba(250,204,21,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center cursor-default"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {/* Tech corner accents */}
                <div className="absolute top-4 left-4 w-2.5 h-2.5 border-t-2 border-l-2 border-[rgba(250,204,21,0.3)] group-hover:border-[var(--primary)] transition-colors duration-300"></div>
                <div className="absolute top-4 right-4 w-2.5 h-2.5 border-t-2 border-r-2 border-[rgba(250,204,21,0.3)] group-hover:border-[var(--primary)] transition-colors duration-300"></div>
                <div className="absolute bottom-4 left-4 w-2.5 h-2.5 border-b-2 border-l-2 border-[rgba(250,204,21,0.3)] group-hover:border-[var(--primary)] transition-colors duration-300"></div>
                <div className="absolute bottom-4 right-4 w-2.5 h-2.5 border-b-2 border-r-2 border-[rgba(250,204,21,0.3)] group-hover:border-[var(--primary)] transition-colors duration-300"></div>

                {/* Ambient gold radial glow behind icon */}
                <div className="absolute top-8 w-16 h-16 bg-[rgba(250,204,21,0.04)] group-hover:bg-[rgba(250,204,21,0.1)] rounded-full blur-md transition-all duration-500"></div>

                {/* Icon Container */}
                <div className="relative z-10 mb-6 w-16 h-16 rounded-2xl bg-[rgba(250,204,21,0.06)] border border-[rgba(250,204,21,0.25)] flex items-center justify-center text-2xl text-[var(--primary)] group-hover:scale-110 transition-transform duration-500">
                  {stat.icon}
                </div>

                {/* Value / Counter */}
                <h3 className="relative z-10 text-4xl sm:text-5xl font-black text-white mb-3">
                  <span className="text-[var(--primary)] animate-text-glow">
                    {startCount ? (
                      <CountUp start={0} end={stat.value} duration={2.5} separator="," />
                    ) : (
                      0
                    )}
                  </span>
                  <span className="text-amber-300">{stat.suffix}</span>
                </h3>

                {/* Divider */}
                <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[rgba(250,204,21,0.3)] to-transparent my-3 group-hover:w-20 transition-all duration-500"></div>

                {/* Label */}
                <p className="relative z-10 text-gray-400 font-bold text-xs sm:text-sm tracking-widest uppercase transition-colors duration-300 group-hover:text-gray-300">
                  &gt; {stat.label} _
                </p>
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
        <div className="absolute left-0 top-24 h-64 w-64 rounded-full bg-[rgba(250,204,21,0.08)] blur-3xl pointer-events-none"></div>
        <div className="absolute right-[-6rem] bottom-8 h-72 w-72 rounded-full bg-[rgba(250,204,21,0.04)] blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="section-kicker mb-4">Learning engine</div>
              <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-[var(--primary)] animate-text-glow md:text-5xl">
                Revolutionize the Way You Learn
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
                Move from passive reading to visual understanding. Each track is designed to feel like a focused developer workspace, not a generic course catalog.
              </p>
            </div>

            <div className="feature-panel rounded-[28px] p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">Active path</p>
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
                className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-300 border cursor-pointer ${activeTab === index
                    ? "border-[var(--primary)] bg-[linear-gradient(135deg,rgba(250,204,21,0.15),rgba(250,204,21,0.08))] text-[var(--primary)] shadow-[0_0_24px_rgba(250,204,21,0.16)]"
                    : "border-[var(--glass-border)] bg-black/30 text-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)]"
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
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-70"></div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    {card.icon}
                  </div>
                  <span className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-gray-500">
                    Module 0{i + 1}
                  </span>
                </div>

                <h3 className="mb-3 text-2xl font-bold text-[var(--primary)]">{card.title}</h3>
                <p className="mb-8 text-sm leading-7 text-gray-400">{card.description}</p>

                <div className="flex items-center justify-between">
                  <button className="text-[var(--primary)] font-semibold transition group-hover:translate-x-1 cursor-pointer">
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[rgba(250,204,21,0.08)] px-4 py-2 text-xs uppercase tracking-[0.32em] text-[var(--primary)]">
              Live feedback lane
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--primary)] animate-text-glow tracking-wide drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]">
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
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-60" />
              <p className="text-sm uppercase tracking-[0.28em] text-gray-500">Trust signal</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--glass-border)] bg-black/30 p-4">
                  <p className="text-3xl font-bold text-[var(--primary)]">10k+</p>
                  <p className="mt-2 text-sm text-gray-400">Learners exploring structured prep every month.</p>
                </div>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-black/30 p-4">
                  <p className="text-3xl font-bold text-[var(--primary)]">4.9/5</p>
                  <p className="mt-2 text-sm text-gray-400">Average satisfaction from guided DSA learning paths.</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-[var(--glass-border)] bg-[linear-gradient(145deg,rgba(250,204,21,0.1),rgba(255,255,255,0.03))] p-6">
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
                            className="h-14 w-14 rounded-2xl border border-[var(--glass-border)] object-cover shadow-[0_0_16px_rgba(250,204,21,0.12)]"
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
                            <FaStar key={idx} className="text-[var(--primary)] drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
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



      {/* SOLUTIONS SECTION */}
      <section className="relative py-28 text-[var(--text-main)] overflow-hidden font-mono" id="solutions">
        {/* Soft decorative ambient lights */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-[rgba(250,204,21,0.02)] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[rgba(250,204,21,0.03)] rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="mb-20 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] text-[var(--primary)] mb-4">
                From Struggle to Mastery
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[var(--primary)] tracking-wide animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.3)] leading-tight">
                AlgoVista Has You Covered
              </h2>
            </div>

            <div className="bg-[#07070a]/60 border border-[rgba(250,204,21,0.12)] rounded-2xl p-6">
              <p className="text-sm leading-7 text-gray-400">
                Learning tech skills shouldn't feel like a guessing game. We diagnose common student roadblocks and swap them for verified paths to engineering excellence.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            {[
              {
                icon: <FaQuestionCircle className="text-2xl text-amber-500" />,
                problem: "I can't visualize how complex algorithms actually work in real-time.",
                solution: "Watch code transform into live, step-by-step animations where every iteration, comparison, and index swap is interactive.",
              },
              {
                icon: <FaTools className="text-2xl text-amber-500" />,
                problem: "I understand the basic syntax but fall short when applying it to problems.",
                solution: "Bridging the gap! Each visual run is paired with hands-on coding challenges designed to lock down true operational concepts.",
              },
              {
                icon: <FaRoad className="text-2xl text-amber-500" />,
                problem: "Prepping for SDE interviews feels overwhelmingly scattered and confusing.",
                solution: "Follow premium, high-integrity SDE roadmaps, structured tracking, and verified curriculum curated by domain experts.",
              },
              {
                icon: <FaFire className="text-2xl text-amber-500" />,
                problem: "I lose consistency and feel isolated preparing on generic platforms.",
                solution: "Gain momentum through interactive leaderboards, streak rewards, and a high-caliber global alumni community.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="group relative grid gap-6 md:grid-cols-[1fr_auto_1.1fr] items-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                {/* 1. Left Card: The Struggle */}
                <div className="relative rounded-3xl p-8 bg-[#0a0a0c]/60 border border-[rgba(250,204,21,0.06)] group-hover:border-red-950/40 transition-all duration-300 min-h-[170px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-widest text-red-500/80 font-bold bg-red-950/20 border border-red-900/30 px-3 py-1 rounded-full">
                        Roadblock 0{i + 1}
                      </span>
                      <span className="text-gray-600 text-sm font-semibold font-mono">[ Struggle ]</span>
                    </div>
                    <p className="text-gray-300 text-base leading-relaxed font-semibold">
                      "{item.problem}"
                    </p>
                  </div>
                </div>

                {/* 2. Middle Element: Glowing Gold Transition Indicator */}
                <div className="flex md:flex-col items-center justify-center py-2 md:py-0">
                  <div className="w-10 h-10 rounded-full bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.3)] flex items-center justify-center text-xs text-[var(--primary)] group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                    <FaArrowRight className="md:rotate-0 rotate-90 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* 3. Right Card: The Mastery */}
                <div className="relative rounded-3xl p-8 bg-[#0d0d10]/90 border border-[rgba(250,204,21,0.18)] group-hover:border-[var(--primary)] group-hover:shadow-[0_0_35px_rgba(250,204,21,0.12)] transition-all duration-500 min-h-[170px] flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(250,204,21,0.03)] rounded-full blur-xl pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-widest text-[var(--primary)] font-bold bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] px-3 py-1 rounded-full flex items-center gap-1.5">
                        {item.icon} AlgoVista Way
                      </span>
                      <span className="text-[var(--primary)] text-sm font-semibold font-mono animate-pulse">[ Mastered ]</span>
                    </div>
                    <p className="text-gray-200 text-base leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY SECTION */}

      <section
        id="community"
        className="relative py-28 text-[var(--text-main)] overflow-hidden grid-bg font-mono"
      >
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {/* Heading */}
          <h2 className="text-5xl font-extrabold mb-6 text-[var(--primary)] animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]">
            Join The AlgoVista Community
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg leading-relaxed">
            Learn. Share. Grow. <span className="font-semibold text-gray-100">AlgoVista</span> isn’t
            just a platform — it’s a home for passionate learners, problem solvers, and future tech
            leaders. Connect with peers, participate in challenges, and level up together.
          </p>

          {/* Community Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUsers className="text-4xl text-[var(--primary)] mb-4 mx-auto" />,
                title: "Peer Learning",
                desc: "Connect with students and developers who share your passion for DSA and development.",
              },
              {
                icon: <FaTrophy className="text-4xl text-[var(--primary)] mb-4 mx-auto" />,
                title: "Challenges & Leaderboards",
                desc: "Compete in weekly challenges, earn points, and climb the ranks while learning.",
              },
              {
                icon: <FaComments className="text-4xl text-[var(--primary)] mb-4 mx-auto" />,
                title: "Interview Stories",
                desc: "Read and share real experiences from tech interviews to learn smart strategies.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-8 glass-card hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:-translate-y-2 transition-all duration-500"
              >
                {item.icon}
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
            <Link
              to="/community"
              className="inline-flex btn-yellow font-mono text-lg px-8 py-4 shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all duration-500 cursor-pointer"
            >
              &gt; Join The Community Now _
            </Link>
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
        <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          {/* Heading */}
          <h2 className="text-5xl font-extrabold mb-6 text-[var(--primary)] animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]">
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
              <div className="glass-card hover:border-[var(--primary)] hover:shadow-[0_0_25px_rgba(250,204,21,0.2)] hover:-translate-y-2 transition-all duration-500 p-6 text-left">
                <div className="flex items-center gap-5">
                  <img
                    src="/images/me2.jpg" // replace with your real image
                    alt="Founder"
                    className="w-24 h-24 rounded-xl object-cover border border-gray-500"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--primary)]">Subhradip Mishra</h3>
                    <p className="text-sm text-gray-400 font-medium">
                      Founder & Full Stack Developer
                    </p>
                    <p className="text-xs text-gray-500">
                      Java • DevOps • Cloud • DSA Instructor
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
                role: "Senior Software Engineer • Google",
                img: "https://randomuser.me/api/portraits/men/75.jpg",
                quote: "Teaching DSA is not about syntax — it's about clarity of logic and flow of thought.",
              },
              {
                name: "Priya Sharma",
                role: "Algorithm Mentor • Ex-Amazon",
                img: "https://randomuser.me/api/portraits/women/65.jpg",
                quote: "I believe anyone can master problem-solving with the right visualization tools.",
              },
              {
                name: "Rohit Patel",
                role: "Instructor • AlgoVista Core Team",
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
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-1">{mentor.name}</h3>
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
          <h2 className="text-5xl font-extrabold mb-6 text-[var(--primary)] animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]">
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
                  className="glass-card hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between p-6"
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
                      <span className="text-gray-300 flex items-center gap-1.5"><FaBookOpen className="text-[var(--primary)] text-sm" /> {item.modules} Modules</span>
                      <span className="text-gray-400 flex items-center gap-1.5"><FaUsers className="text-[var(--primary)] text-sm" /> {item.learners} Learners</span>
                    </div>
                  </div>

                  <button className="mt-6 w-full btn-outline hover-tech-yellow py-2 rounded-lg transition-all duration-300 cursor-pointer">
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
            <h2 className="text-5xl font-extrabold text-[var(--primary)] animate-text-glow leading-tight">
              Unlock Your Career Potential with{" "}
              <span className="text-amber-200">Our Expert Guidance</span>
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
                  <FaCheckCircle className="text-[var(--primary)] text-xl flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button className="mt-10 btn-yellow px-8 py-4 flex items-center gap-2 cursor-pointer">
              Start Learning <FaRocket className="inline-block" />
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
          <h2 className="text-5xl font-extrabold text-center mb-10 text-[var(--primary)] animate-text-glow drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto text-sm leading-relaxed">
            Everything you need to know about <span className="font-semibold text-gray-100">AlgoVista</span> and how it helps you master your tech journey.
          </p>

          {/* FAQ Boxes */}
          {[
            {
              question: "What is AlgoVista?",
              answer: "AlgoVista is your all-in-one learning hub for mastering DSA, Full Stack Development, DevOps, and Java — designed for students who want to learn smartly with visualized explanations."
            },
            {
              question: "Is AlgoVista free to use?",
              answer: "Yes! Most of the core content is free. You can start learning anytime. Advanced mentorship, guided projects, and certifications are part of premium access."
            },
            {
              question: "Who are the instructors?",
              answer: "All mentors are experienced developers from top tech backgrounds — led by Subhradip Mishra, Founder of AlgoVista, Full Stack & DevOps Engineer, and DSA Instructor."
            },
            {
              question: "How do I start learning?",
              answer: "Simply pick your roadmap — DSA, MERN, Full Stack, or DevOps — and click ‘Get Started’. AlgoVista will guide you step-by-step through interactive modules."
            },
            {
              question: "Will I receive a certificate?",
              answer: "Yes, you'll receive a verified completion certificate for finishing roadmaps or solving structured DSA challenges."
            }
          ].map((faq, i) => {
            const open = openFaq === i;
            return (
              <div
                key={i}
                onClick={() => setOpenFaq(open ? null : i)}
                className={`cursor-pointer mb-6 glass-card p-6 transition-all duration-500 hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] ${open ? "border-[var(--primary)]" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-100">{faq.question}</h3>
                  <span className={`text-xl font-bold transition-transform duration-500 ${open ? "text-[var(--primary)]" : "text-gray-400"}`}>
                    {open ? <FaMinus /> : <FaPlus />}
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



      {/* ðŸŒ  Get in Touch Section */}
      <section className="w-full py-24 px-6 relative overflow-hidden font-mono grid-bg border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT: Form */}
          <div className="text-left space-y-6 ">
            <h2 className="text-5xl font-extrabold text-[var(--primary)] animate-text-glow leading-tight drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]">
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
                className="col-span-1 md:col-span-2 p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <input
                type="text"
                placeholder="What's this about?"
                className="p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />

              <textarea
                rows="4"
                placeholder="Tell us more about your inquiry..."
                className="col-span-1 md:col-span-2 p-3 glass-card focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              ></textarea>

              <button
                type="submit"
                className="col-span-1 md:col-span-2 btn-yellow py-3 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                Send Message <FaArrowRight className="h-4 w-4" />
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
              className="w-full max-w-[320px] h-auto object-contain rounded-lg shadow-[0_0_25px_rgba(250,204,21,0.15)] hover:shadow-[0_0_35px_rgba(250,204,21,0.3)] hover:scale-105 transition duration-300 mx-auto"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.06),transparent_42%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="footer-hero mb-10 grid gap-8 rounded-[32px] p-8 lg:grid-cols-[1.1fr_0.9fr] border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.05)]">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[rgba(250,204,21,0.02)] rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col justify-between h-full space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--primary)] mb-2">Build momentum</p>
                <h3 className="text-3xl font-extrabold leading-tight text-[var(--primary)] animate-text-glow">
                  Keep your prep focused with guided roadmaps, visual explainers, and interactive code.
                </h3>
                <p className="mt-4 text-sm leading-7 text-gray-400 max-w-lg">
                  Every concept visualized is another pattern mastered. Start building consistency today with structured pathways and a platform built for learners.
                </p>
              </div>

              {/* Action Rows */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup" className="btn-yellow text-sm py-2.5 px-6 font-semibold">
                    Create Free Account
                  </Link>
                  <Link to="/roadmaps" className="btn-outline text-sm py-2.5 px-6 font-semibold">
                    Explore Roadmaps
                  </Link>
                </div>

                <div className="grid gap-3 grid-cols-2 max-w-sm pt-2">
                  <div className="rounded-xl border border-[var(--glass-border)] bg-black/40 p-3">
                    <p className="text-xl font-black text-[var(--primary)]">12,000+</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Active Learners</p>
                  </div>
                  <div className="rounded-xl border border-[var(--glass-border)] bg-black/40 p-3">
                    <p className="text-xl font-black text-[var(--primary)]">480+</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Visualizations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HIGH TECH INTERACTIVE TERMINAL WIDGET */}
            <div className="rounded-2xl border border-[rgba(250,204,21,0.18)] bg-[#030305]/95 shadow-inner overflow-hidden font-mono text-xs flex flex-col justify-between h-[280px]">
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--glass-border)] bg-black/60">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
                </div>
                <span className="text-[10px] tracking-wider text-gray-500 font-semibold uppercase">interactive-shell v2</span>
                <span className="text-[10px] text-green-500 animate-pulse font-bold">ONLINE</span>
              </div>

              {/* Terminal Display */}
              <div className="p-4 flex-1 overflow-y-auto space-y-1.5 scrollbar-thin select-none text-left">
                {cliOutput.map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      line.startsWith("$")
                        ? "text-[var(--primary)] font-bold"
                        : line.startsWith("✓") || line.startsWith("🔓")
                        ? "text-green-400 font-semibold"
                        : line.includes("Available commands") || line.includes(" - ")
                        ? "text-amber-200"
                        : "text-gray-400"
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Terminal CLI Form Input */}
              <form
                onSubmit={handleCliSubmit}
                className="flex items-center border-t border-[var(--glass-border)] bg-black/80 px-4 py-2"
              >
                <span className="text-[var(--primary)] font-bold mr-2 select-none">$</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type 'help' and press Enter..."
                  className="flex-1 bg-transparent text-[var(--primary)] outline-none border-none placeholder-gray-600 caret-[var(--primary)] text-xs font-semibold"
                />
                <button
                  type="submit"
                  className="text-[10px] text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors duration-200"
                >
                  RUN
                </button>
              </form>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <h4 className="text-lg font-semibold text-[var(--primary)]">AlgoVista</h4>
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
                  <Link key={item.label} to={item.to} className="block text-gray-300 transition hover:text-[var(--primary)]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-gray-500">On This Page</h4>
              <div className="mt-4 space-y-3 text-sm">
                {footerResources.map((item) => (
                  <a key={item.label} href={item.href} className="block text-gray-300 transition hover:text-[var(--primary)]">
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

