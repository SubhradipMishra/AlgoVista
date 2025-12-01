import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { PlayCircleOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { Collapse } from "antd";import { FaUserCircle } from "react-icons/fa";
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
    icon: "🖥️",
    cards: [
      { icon: "🖥️", title: "Striver’s DSA Sheet", description: "Your ultimate guide to mastering DSA with curated questions." },
      { icon: "📚", title: "Core DSA Topics", description: "Simplify complex concepts with a structured and focused approach." },
      { icon: "📝", title: "Problem-Solving Made Easy", description: "Solve a variety of problems to sharpen your skills and prepare for interviews." },
    ],
  },
  {
    title: "Core Subjects",
    icon: "📚",
    cards: [
      { icon: "📚", title: "Data Structures", description: "Master Arrays, Linked Lists, Trees, Graphs and more." },
      { icon: "⚙️", title: "System Design", description: "Learn scalable and efficient architecture concepts." },
    ],
  },
  {
    title: "Interview Experience",
    icon: "💬",
    cards: [
      { icon: "💬", title: "Real Interviews", description: "Read and learn from developers' real-world interview journeys." },
    ],
  },
  {
    title: "Practice Problems",
    icon: "📝",
    cards: [
      { icon: "📝", title: "Curated Problems", description: "Solve problems that enhance your skills and prepare you for interviews." },
    ],
  },
];

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

  // Simulate typing code
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < typingCode.length) {
        setDisplayedLines((prev) => [...prev, typingCode[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Typing heading animation
  const words = ["Visualize Algorithms", "Core Subjects", "System Design", "Ace DSA"];
  const [displayedHeading, setDisplayedHeading] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typingSpeed = 120;
    const pauseTime = 1500;
    const timeout = setTimeout(() => {
      setDisplayedHeading(words[wordIndex].substring(0, charIndex + 1));
      if (charIndex + 1 === words[wordIndex].length) {
        setTimeout(() => {
          setCharIndex(0);
          setWordIndex((prev) => (prev + 1) % words.length);
          setDisplayedHeading("");
        }, pauseTime);
      } else {
        setCharIndex((prev) => prev + 1);
      }
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex]);

  return (
    <div className="min-h-screen flex flex-col text-gray-200 grid-bg overflow-x-hidden">
      {/* Navbar */}
  

<nav
  className={`fixed top-0 z-50 w-full transition-all duration-300 font-mono border-b border-gray-800
    ${isScrolled ? "backdrop-blur-xl bg-black/70 py-3" : "bg-black py-5"}
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
        className="relative hover:text-white transition-all group"
      >
        Home
        <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gray-400 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      {/* Resources Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-1 hover:text-white transition-all">
          Resources <span className="ml-1 group-hover:rotate-180 transition-transform">▼</span>
        </button>
        <div className="absolute left-0 mt-3 w-60 bg-black/95 border border-gray-700 rounded-xl opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-300 shadow-xl">
          <div className="p-3 space-y-2">
            {[{ name: "SDE Sheet", icon: "📝" }, { name: "System Design", icon: "⚙️" }, { name: "Core Subjects", icon: "📚" }, { name: "Interview Story", icon: "💬" }].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
                <span>{item.icon}</span> <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link to="/roadmaps" className="relative hover:text-white transition-all group">
        Roadmap
        <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gray-400 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link to="/problems" className="relative hover:text-white transition-all group">
        Problems
        <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gray-400 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link to="/mentorship" className="relative hover:text-white transition-all group">
        Mentorship
        <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gray-400 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link to="success-stories" className="relative hover:text-white transition-all group">
        Success Stories
        <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gray-400 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link to="devtools" className="relative hover:text-white transition-all group">
        Dev Tools
        <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gray-400 transition-all duration-300 group-hover:w-full"></span>
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
            <span className="ml-2 text-gray-500 group-hover:text-gray-300 transition-transform group-hover:rotate-180">▼</span>
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
                  📊 Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-5 py-2 text-left text-red-400 hover:bg-red-900/20"
                >
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <Link to="/login"><button className="px-4 py-1 border border-gray-600 text-gray-300 hover:bg-gray-800">Login</button></Link>
          <Link to="/signup"><button className="px-4 py-1 bg-gray-200 text-black font-bold hover:bg-white">Sign Up</button></Link>
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
    <div className="md:hidden bg-black/95 border-t border-gray-800 shadow-xl w-full absolute top-full left-0 flex flex-col items-center py-4 space-y-3 animate-slide-down text-gray-300 font-mono">
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
          className="text-lg hover:text-white"
        >
          {item.name}
        </Link>
      ))}

      {session ? (
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md w-32">Logout</button>
      ) : (
        <>
          <Link to="/login"><button className="px-4 py-2 border border-gray-600 text-gray-300 w-32">Login</button></Link>
          <Link to="/signup"><button className="px-4 py-2 bg-gray-200 text-black font-bold w-32">Sign Up</button></Link>
        </>
      )}
    </div>
  )}
</nav>



      {/* Hero Section */}
<section className="relative flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-20 md:py-28 gap-8 md:gap-12 mt-20 font-mono text-gray-200 bg-black overflow-hidden">

  {/* Background Grid */}
  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

  {/* Corner soft white glows */}
  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full animate-bloat-slow blur-2xl pointer-events-none"></div>
  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full animate-bloat-slow blur-3xl pointer-events-none"></div>
  <div className="absolute top-1/2 right-0 w-24 h-24 bg-white/5 rounded-full animate-bloat-slower blur-2xl pointer-events-none"></div>

  {/* Text Section */}
  <motion.div
    className="flex-1 w-full relative z-10"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >

    {/* Tag Badge */}
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600 bg-gray-900/60 text-gray-300 text-sm font-medium mb-6 shadow-sm">
      <span className="text-base">✨</span>
      <span>Our mission — free knowledge and advanced learning with great mentors.</span>
    </div>

    {/* Heading */}
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-snug tracking-tight text-gray-100 mb-6">
      {displayedHeading} <br />
      <span className="text-gray-400">The Smarter Way</span>
    </h1>

    <p className="text-gray-300 text-base sm:text-lg mb-6 max-w-full sm:max-w-md">
      Master complex algorithms through step-by-step visualizations that bring each logic to life.
    </p>

    <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-full sm:max-w-md">
      From sorting and searching to graph traversal and dynamic programming — explore, visualize, and strengthen your DSA foundation like never before.
    </p>

    {/* Buttons */}
    <div className="flex flex-wrap gap-3 sm:gap-4">
      <Link
        to="/problems"
        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-lg text-base sm:text-lg transition w-full sm:w-auto border border-gray-700"
      >
        <PlayCircleOutlined className="text-lg" />
        Start Exploring
      </Link>

      <Link
        to="/problems"
        className="flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 hover:text-black font-semibold px-6 py-2.5 rounded-lg text-base sm:text-lg transition-all border border-gray-400 w-full sm:w-auto"
      >
        <PlayCircleOutlined className="text-lg" />
        Learn More
      </Link>
    </div>
  </motion.div>

  {/* Coding Commands Section */}
  <motion.div
    className="flex-1 w-full grid grid-cols-1 gap-4 relative z-10"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.2 }}
  >
    <pre className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-gray-200 font-mono shadow-lg overflow-x-auto hover:shadow-white/20 transition-all">
      <code>
        <span className="text-blue-400">npm</span> install algovista-cli<br/>
        <span className="text-green-400">git</span> clone https://github.com/AlgoVista/DSA-Visualizer<br/>
        <span className="text-yellow-400">node</span> run visualizer.js --start<br/>
        <span className="text-purple-400">yarn</span> challenge daily-problem
      </code>
    </pre>

    <pre className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-gray-200 font-mono shadow-lg overflow-x-auto hover:shadow-white/20 transition-all">
      <code>
        <span className="text-green-400">$</span> mkdir ~/DSA_Projects<br/>
        <span className="text-green-400">$</span> cd ~/DSA_Projects<br/>
        <span className="text-blue-400">python</span> visualizer.py --algo sorting --step 1
      </code>
    </pre>

    <pre className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-gray-200 font-mono shadow-lg overflow-x-auto hover:shadow-white/20 transition-all">
      <code>
        <span className="text-purple-400">#</span> Explore algorithms interactively<br/>
        <span className="text-purple-400">#</span> Track your daily progress<br/>
        <span className="text-purple-400">#</span> Join the community & solve challenges
      </code>
    </pre>
  </motion.div>

  {/* Animations */}
  <style>
    {`
      @keyframes bloat {
        0%, 100% { transform: scale(1); opacity: 0.2; }
        50% { transform: scale(1.35); opacity: 0.35; }
      }
      .animate-bloat-slow { animation: bloat 8s infinite ease-in-out; }
      .animate-bloat-slower { animation: bloat 12s infinite ease-in-out; }
    `}
  </style>
</section>






      {/* Stats Section */}
    <section
  ref={ref}
  className="relative py-24 bg-black text-gray-200 overflow-hidden font-mono"
>
  <div className="max-w-6xl mx-auto text-center relative z-10">

    {/* Title */}
    <h2 className="text-5xl font-extrabold text-center text-white mb-20 tracking-wide 
      drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
      Stats That Define AlgoVista
    </h2>

 
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-5">
      {[
        { label: "Active Users", value: 12000 },
        { label: "Algorithms Visualized", value: 480 },
        { label: "Live Sessions", value: 85 }
      ].map((stat, i) => (
        <motion.div
          key={i}
          className="group relative p-8 sm:p-12 rounded-xl 
            bg-[#111] border border-gray-700 shadow-[0_0_10px_rgba(255,255,255,0.05)]
            hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
            transition-all duration-500 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
        >
          {/* Value */}
          <div className="relative z-10 text-center">
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
              {startCount ? (
                <CountUp start={0} end={stat.value} duration={2.5} />
              ) : (
                0
              )}
              +
            </h3>

            {/* Label */}
            <p className="text-gray-400 font-semibold text-lg tracking-widest uppercase">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>


      {/* Features Section */}
      <section
  className="py-24 bg-black text-gray-200 relative overflow-hidden grid-bg font-mono"
  id="features"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6">

    {/* Title */}
    <h2
      className="text-5xl font-extrabold text-center text-white mb-20 
      tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]"
    >
      Revolutionize the Way You Learn
    </h2>

    {/* Tabs */}
    <div className="flex justify-center gap-4 sm:gap-6 mb-12 flex-wrap">
      {featureTabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={`px-5 sm:px-7 py-2.5 rounded-full font-semibold 
            transition-all duration-300 border shadow-md
            ${
              activeTab === index
                ? "bg-white text-black border-white shadow-[0_0_18px_rgba(255,255,255,0.4)]"
                : "bg-[#111] text-gray-200 border-gray-700 hover:bg-[#1a1a1a] hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            }`}
        >
          {tab.title}
        </button>
      ))}
    </div>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {featureTabs[activeTab].cards?.map((card, i) => (
        <motion.div
          key={i}
          className="relative bg-[#0d0d0d] p-6 sm:p-8 rounded-2xl 
            border border-gray-700 shadow-[0_0_10px_rgba(255,255,255,0.07)]
            hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
            transition-all duration-500 hover:scale-105 group"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
        >
          {/* Icon */}
          <div className="text-4xl mb-4 text-white transition-transform duration-500 
            group-hover:scale-125 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
            {card.icon}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 mb-6">
            {card.description}
          </p>

          {/* Button */}
          <button
            className="text-white font-semibold hover:underline 
              hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition"
          >
            Get Started →
          </button>
        </motion.div>
      ))}
    </div>
  </div>
</section>

{/* REVIEW SECTION */}

<section className="relative py-24 bg-black text-gray-200 overflow-hidden font-mono" id="reviews">
  <h2 className="text-5xl font-extrabold text-center text-gray-100 mb-20 tracking-wide">
    What Our Students Say
  </h2>

  <div className="relative w-full overflow-hidden">
    <motion.div
      className="flex gap-6 w-max"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
    >
      {[...[ // Duplicate to make infinite loop
        {
          name: "John Doe",
          role: "Frontend Developer",
          review: "This platform made algorithms so much easier to understand!",
          rating: 5,
          avatar: "https://i.pravatar.cc/100?img=1",
        },
        {
          name: "Jane Smith",
          role: "Backend Developer",
          review: "Step-by-step visualizations helped me ace my interviews!",
          rating: 4,
          avatar: "https://i.pravatar.cc/100?img=2",
        },
        {
          name: "Alice Johnson",
          role: "Fullstack Developer",
          review: "Amazing learning experience. Highly recommended!",
          rating: 3,
          avatar: "https://i.pravatar.cc/100?img=3",
        },
        {
          name: "Bob Williams",
          role: "MERN Stack Developer",
          review: "The DSA visualizer is extremely interactive and intuitive.",
          rating: 5,
          avatar: "https://i.pravatar.cc/100?img=4",
        }
      ], ...[
        {
          name: "John Doe",
          role: "Frontend Developer",
          review: "This platform made algorithms so much easier to understand!",
          rating: 5,
          avatar: "https://i.pravatar.cc/100?img=1",
        },
        {
          name: "Jane Smith",
          role: "Backend Developer",
          review: "Step-by-step visualizations helped me ace my interviews!",
          rating: 4,
          avatar: "https://i.pravatar.cc/100?img=2",
        },
        {
          name: "Alice Johnson",
          role: "Fullstack Developer",
          review: "Amazing learning experience. Highly recommended!",
          rating: 3,
          avatar: "https://i.pravatar.cc/100?img=3",
        },
        {
          name: "Bob Williams",
          role: "MERN Stack Developer",
          review: "The DSA visualizer is extremely interactive and intuitive.",
          rating: 5,
          avatar: "https://i.pravatar.cc/100?img=4",
        }
      ]].map((review, i) => (
        <div
          key={i}
          className="bg-gray-900/90 p-6 shadow-[0_0_25px_rgba(0,0,0,0.7)] flex-shrink-0 w-80 h-80 border border-gray-800 hover:border-gray-400 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-500 relative overflow-hidden flex flex-col justify-between rounded-3xl backdrop-blur-sm"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-3xl"></div>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={review.avatar}
              alt={review.name}
              className="w-16 h-16 rounded-full border-2 border-gray-600 shadow-md"
            />
            <div>
              <h3 className="text-gray-100 font-semibold">{review.name}</h3>
              <p className="text-gray-400 text-sm">{review.role}</p>
            </div>
          </div>

          <p className="text-gray-300 mb-4">{review.review}</p>

          <div className="flex items-center gap-1 mt-auto">
            {[...Array(review.rating)].map((_, idx) => (
              <FaStar key={idx} className="text-gray-100" />
            ))}
            {[...Array(5 - review.rating)].map((_, idx) => (
              <FaStar key={idx} className="text-gray-600" />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  </div>

  {/* Background subtle bubbles */}
  <div className="absolute top-10 left-0 w-32 h-32 bg-white/10 rounded-full animate-bloat-slow blur-xl pointer-events-none"></div>
  <div className="absolute bottom-10 right-0 w-40 h-40 bg-white/10 rounded-full animate-bloat-slow blur-2xl pointer-events-none"></div>
  <div className="absolute top-1/2 right-10 w-24 h-24 bg-white/5 rounded-full animate-bloat-slower blur-xl pointer-events-none"></div>
</section>



{/* FIX SECTION */}
<section className="relative py-28 bg-black text-gray-200 overflow-hidden font-mono grid-bg" id="solutions">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-5xl font-extrabold text-center text-gray-100 mb-20 tracking-wide">
      AlgoVista Has You Covered
    </h2>

    <div className="relative border-l-2 border-gray-700/50 ml-8 space-y-16">
      {[
        {
          emoji: "😩",
          problem: "I can’t visualize how algorithms actually work.",
          solution:
            "AlgoVista transforms code into step-by-step animations so you can watch every iteration, comparison, and swap in real-time.",
        },
        {
          emoji: "😕",
          problem: "I know the concepts but can’t apply them to problems.",
          solution:
            "Learn by doing! Each visualization is paired with interactive coding challenges that help you connect theory with implementation.",
        },
        {
          emoji: "😔",
          problem: "Preparing for interviews feels confusing and unstructured.",
          solution:
            "AlgoVista gives you curated roadmaps, SDE sheets, and topic-wise progress tracking to keep your prep focused and efficient.",
        },
        {
          emoji: "😓",
          problem: "It’s hard to stay consistent while learning alone.",
          solution:
            "With streak tracking, leaderboards, and a friendly community, AlgoVista keeps your motivation high and progress measurable.",
        },
      ].map((item, i) => (
        <div key={i} className="relative group pl-10">
          {/* Connector Dot */}
          <div className="absolute -left-[22px] top-3 w-4 h-4 rounded-full bg-gray-700 border-2 border-black"></div>

          {/* Card */}
          <div className="backdrop-blur-sm bg-gray-900/80 border border-gray-800 hover:border-gray-600 transition-all duration-500 rounded-2xl p-8 shadow-[0_0_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">{item.emoji} Problem</h3>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">{item.problem}</p>
            <div className="bg-gray-800/50 border-l-2 border-gray-600 pl-4 py-3 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-100 mb-1">💡 AlgoVista Solution</h4>
              <p className="text-gray-200 leading-relaxed">{item.solution}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Background subtle glow elements */}
  <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
  <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

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
  className="relative py-28 bg-black text-gray-200 overflow-hidden grid-bg font-mono"
>
  <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
    {/* Heading */}
    <h2 className="text-5xl font-extrabold mb-6 text-gray-100">
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
          title: "🤝 Peer Learning",
          desc: "Connect with students and developers who share your passion for DSA and development.",
        },
        {
          title: "🏆 Challenges & Leaderboards",
          desc: "Compete in weekly challenges, earn points, and climb the ranks while learning.",
        },
        {
          title: "💬 Interview Stories",
          desc: "Read and share real experiences from tech interviews to learn smart strategies.",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="group relative p-8 rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(255,255,255,0.1)] transition-all duration-500"
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
      <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500">
        Join The Community Now
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
  className="relative py-28 bg-black text-gray-200 overflow-hidden grid-bg font-mono"
>
  {/* Background softly blurred circles */}
  <div className="absolute top-0 left-0 w-72 h-72 bg-gray-700/20 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-800/20 rounded-full blur-3xl"></div>

  <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
    {/* Heading */}
    <h2 className="text-5xl font-extrabold mb-6 text-gray-100">
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
        <div className="bg-gray-900/90 border border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 p-6 text-left">
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
          quote: "Teaching DSA is not about syntax — it’s about clarity of logic and flow of thought.",
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
  className="relative py-28 bg-black text-gray-200 overflow-hidden grid-bg font-mono"
>
  {/* Background floating bubbles */}
  <div className="absolute top-10 left-10 w-20 h-20 bg-gray-700/20 rounded-full blur-3xl animate-bloat-slow"></div>
  <div className="absolute top-1/3 right-20 w-24 h-24 bg-gray-800/20 rounded-full blur-3xl animate-bloat-slower"></div>
  <div className="absolute bottom-10 left-1/4 w-28 h-28 bg-gray-600/20 rounded-full blur-3xl animate-bloat-slow"></div>

  <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
    {/* Heading */}
    <h2 className="text-5xl font-extrabold mb-6 text-gray-100">
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
            className="bg-gray-900/70 p-6 rounded-2xl border border-gray-700 hover:border-gray-500 hover:shadow-lg transition-all duration-500 flex flex-col justify-between"
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
                <span className="text-gray-300">📚 {item.modules} Modules</span>
                <span className="text-gray-400">👥 {item.learners} Learners</span>
              </div>
            </div>

            <button className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-all duration-300">
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



<section id="career-section" className="w-full bg-black py-24 px-6 font-mono">
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
            <span className="text-gray-400 text-2xl">✔</span> {item}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button className="mt-10 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 flex items-center gap-2">
        Start Learning 🚀
      </button>
    </div>
  </div>
</section>




   {/* FREQENUTLY SECTION */}

<section
  id="faq"
  className="relative py-24 bg-black text-gray-200 overflow-hidden grid-bg font-mono"
>
  {/* Background bubbles */}
  <div className="absolute top-0 left-0 w-72 h-72 bg-gray-700/20 rounded-full blur-3xl animate-pulse-slow"></div>
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-800/20 rounded-full blur-3xl animate-pulse-slow"></div>

  <div className="max-w-5xl mx-auto px-6 relative z-10">
    {/* Heading */}
    <h2 className="text-5xl font-extrabold text-center mb-10 text-gray-100">
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
        answer: "Yes, you’ll receive a verified completion certificate for finishing roadmaps or solving structured DSA challenges."
      }
    ].map((faq, i) => {
      const [open, setOpen] = React.useState(false);
      return (
        <div
          key={i}
          onClick={() => setOpen(!open)}
          className={`cursor-pointer mb-6 border border-gray-700 rounded-xl bg-gray-900/70 p-6 transition-all duration-500 hover:border-gray-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] ${open ? "border-gray-500" : ""}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-100">{faq.question}</h3>
            <span className={`text-2xl font-bold text-gray-400 transition-transform duration-500 ${open ? "rotate-180" : ""}`}>
              {open ? "−" : "+"}
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



{/* 🌐 Get in Touch Section */}
<section className="w-full bg-black py-24 px-6 relative overflow-hidden font-mono grid-bg">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
    
    {/* LEFT: Form */}
    <div className="text-left space-y-6 ">
      <h2 className="text-5xl font-extrabold text-gray-100 leading-tight">
        Reach Out{" "}
        <span className="text-gray-300">Today</span>
      </h2>
      <p className="text-gray-400">
        Have a question or want to discuss your learning path? We’re here to assist you.
      </p>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Enter your full name"
          className="col-span-1 md:col-span-2 p-3 rounded-lg bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <input
          type="email"
          placeholder="Enter your email"
          className="p-3 rounded-lg bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <input
          type="tel"
          placeholder="Enter your phone number"
          className="p-3 rounded-lg bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <input
          type="text"
          placeholder="What's this about?"
          className="p-3 rounded-lg bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />

        <textarea
          rows="4"
          placeholder="Tell us more about your inquiry..."
          className="col-span-1 md:col-span-2 p-3 rounded-lg bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        ></textarea>

        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
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
        className="w-80 h-80 object-contain rounded-lg shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:scale-105 transition duration-300"
      />
    </div>

  </div>
</section>



   



      {/* Footer */}
    <footer className="bg-black text-gray-300 py-14 font-mono">
  <div className="max-w-6xl mx-auto grid md:grid-cols-4 sm:grid-cols-2 gap-10 px-6">
    
    {/* About */}
    <div>
      <h3 className="text-gray-100 text-lg font-semibold mb-4">AlgoVista</h3>
      <p className="text-sm text-gray-400">
        Building the next generation of algorithm visualization tools for learners and developers.
      </p>
    </div>

    {/* Quick Links */}
    <div>
      <h4 className="text-gray-100 font-semibold mb-3">Quick Links</h4>
      <ul className="space-y-2 text-sm">
        <li><Link to="/login" className="hover:text-gray-100 transition">Login</Link></li>
        <li><Link to="/signup" className="hover:text-gray-100 transition">Signup</Link></li>
        <li><a href="#features" className="hover:text-gray-100 transition">Features</a></li>
        <li><a href="#problems" className="hover:text-gray-100 transition">Problems</a></li>
        <li><a href="#reviews" className="hover:text-gray-100 transition">Reviews</a></li>
      </ul>
    </div>

    {/* Address */}
    <div>
      <h4 className="text-gray-100 font-semibold mb-3">Address</h4>
      <p className="text-sm text-gray-400">
        AlgoVista HQ, Tower 4 <br />
        Bengaluru, India 560103 <br />
        contact@AlgoVista.com
      </p>
    </div>

    {/* Socials */}
    <div>
      <h4 className="text-gray-100 font-semibold mb-3">Follow Us</h4>
      <div className="flex gap-4 text-lg">
        <a href="#" className="hover:text-gray-100 transition"><FaGithub /></a>
        <a href="#" className="hover:text-gray-100 transition"><FaLinkedin /></a>
        <a href="#" className="hover:text-gray-100 transition"><FaTwitter /></a>
      </div>
    </div>
  </div>

  {/* Footer bottom */}
  <div className="text-center mt-10 text-sm text-gray-500 border-t border-gray-800 pt-6">
    © {new Date().getFullYear()} AlgoVista. All rights reserved.
  </div>
</footer>

    
    </div>
  );
};

export default Home;
