import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaRocket,
  FaCode,
  FaLayerGroup,
  FaUsers,
  FaCheckCircle,
  FaTimes,
  FaShieldAlt,
  FaClock,
  FaArrowRight,
  FaChevronDown,
  FaUserCircle,
  FaTrophy,
  FaGem,
  FaStar,
  FaQuestionCircle,
  FaBolt
} from "react-icons/fa";
import { useRazorpay } from "react-razorpay";
import axios from "axios";
import Context from "../util/context";
import AlgoTufEliteSection from "./AlgoTufEliteSection";

const faqs = [
  {
    q: "What is AlgoTUF Elite?",
    a: "AlgoTUF Elite is a joint collaboration program between takeUforward (TUF) and AlgoVista. It gives learners complete access to both platforms' top resources for a single price of ₹5,999.",
  },
  {
    q: "What is included in the ₹5,999 price?",
    a: "You get 18 Months access to TUF Sprint Package, 12 Months access to AlgoVista's MERN Stack Full Course, 6 Months access to AlgoVista's Premium System Design Roadmap, and 1 Month of Group Mentorship sessions.",
  },
  {
    q: "Are there any discounts available for this program?",
    a: "No, the program price is fixed at ₹5,999 with no additional discounts, as it already bundle over ₹18,000+ worth of top-tier courses and mentorship.",
  },
  {
    q: "How do I access the TUF Sprint Package after purchase?",
    a: "Once enrolled, your pass gets activated instantly. You will receive access instructions and single sign-on links directly on your AlgoTUF dashboard and via email.",
  },
  {
    q: "Is live group mentorship included?",
    a: "Yes! You get 1 month of dedicated group mentorship including weekly Q&A sessions, mock interview tips, resume reviews, and direct mentor interaction.",
  },
];

const AlgoTufElitePage = () => {
  const { Razorpay } = useRazorpay();
  const { session, setSession } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [enrolledStatus, setEnrolledStatus] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    checkStatus();
  }, [session]);

  const checkStatus = async () => {
    if (!session) return;
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/algotuf/status`, {
        withCredentials: true,
      });
      if (data.success && data.enrolled) {
        setEnrolledStatus(data.enrollment);
      }
    } catch (err) {
      console.log("Status check:", err);
    }
  };

  const handleEnrollNow = async () => {
    if (!session) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/algotuf/order`,
        {},
        { withCredentials: true }
      );

      if (!data.success || !data.order) {
        alert("Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RZP_KEY || "rzp_test_SrKIlIS4UjIGK5",
        amount: data.order.amount,
        currency: "INR",
        name: "AlgoTUF Elite Program",
        description: "TUF x AlgoVista Exclusive Pass",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/payment/algotuf/verify`,
              { paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id },
              { withCredentials: true }
            );
            alert("🎉 Welcome to AlgoTUF Elite!");
            checkStatus();
          } catch (err) {
            console.error(err);
            alert("Payment recorded!");
          }
        },
        prefill: {
          name: session.fullname || "",
          email: session.email || "",
          contact: session.contact || "9999999999",
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Payment initialization error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-gray-200 font-mono relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[rgba(250,204,21,0.06)] rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-[rgba(6,182,212,0.04)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-[-10%] w-[500px] h-[500px] bg-[rgba(168,85,247,0.05)] rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-2xl py-4 border-b border-[rgba(250,204,21,0.15)] shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo.png"
              alt="AlgoVista Logo"
              className="w-10 h-10 object-cover rounded-full border border-[var(--primary)] shadow-[0_0_15px_rgba(250,204,21,0.3)]"
            />
            <span className="font-black text-lg text-white tracking-wider">
              ALGO<span className="text-[var(--primary)]">VISTA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-300">
            <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <Link to="/roadmaps" className="hover:text-[var(--primary)] transition-colors">Roadmaps</Link>
            <Link to="/courses" className="hover:text-[var(--primary)] transition-colors">Courses</Link>
            <Link to="/algotuf-elite" className="text-[var(--primary)] font-black border-b-2 border-[var(--primary)] pb-0.5">AlgoTUF Elite</Link>
            <Link to="/mentorship" className="hover:text-[var(--primary)] transition-colors">Mentorship</Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <span className="text-xs font-bold text-[var(--primary)] bg-black/60 border border-[rgba(250,204,21,0.2)] px-4 py-2 rounded-xl">
                {session.fullname}
              </span>
            ) : (
              <Link to="/login" className="btn-yellow text-xs py-2 px-5 font-bold uppercase tracking-wider">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[var(--primary)] bg-[rgba(250,204,21,0.1)] text-[var(--primary)] text-xs font-black uppercase tracking-[0.25em] mb-8 shadow-[0_0_25px_rgba(250,204,21,0.25)]"
        >
          <FaBolt className="text-amber-400 animate-pulse text-sm" />
          <span>Official Collaboration: takeUforward × AlgoVista</span>
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-[1.1] mb-6">
          UNLOCK THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-amber-300 to-amber-500 animate-text-glow">
            AlgoTUF Elite Pass
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12">
          One unified membership giving you shared resource access across takeUforward and AlgoVista. Accelerate your career with elite DSA sheets, full-stack mastery, system design, and 1-on-1 style group mentorship.
        </p>

        {enrolledStatus ? (
          <div className="inline-flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-8 py-4 rounded-2xl font-bold uppercase text-sm tracking-wider">
            <FaCheckCircle className="text-xl" />
            <span>You possess an Active AlgoTUF Elite Pass!</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button
              onClick={handleEnrollNow}
              disabled={loading}
              className="py-4 px-10 rounded-2xl font-black uppercase text-sm tracking-widest text-black bg-gradient-to-r from-[var(--primary)] via-amber-400 to-amber-500 hover:shadow-[0_0_35px_rgba(250,204,21,0.5)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-3"
            >
              <FaGem className="text-lg" />
              <span>Get AlgoTUF Elite @ ₹5,999</span>
            </button>
          </div>
        )}
      </section>

      {/* AlgoTUF Elite Main Section */}
      <AlgoTufEliteSection isStandalone={true} />

      {/* What You Get Breakdown Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto font-mono">
        <div className="text-center mb-16">
          <div className="text-xs text-[var(--primary)] uppercase font-bold tracking-[0.3em] mb-3">Comprehensive Package</div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Everything Inside AlgoTUF Elite</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl p-8 bg-[#080811] border border-white/10 relative overflow-hidden">
            <div className="text-3xl text-amber-400 mb-4"><FaRocket /></div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">18 Months Access</span>
            <h3 className="text-2xl font-black text-white mt-4 mb-3">TUF Sprint Package</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Created by Striver (takeUforward), this sprint package offers high-impact practice problems, video breakdowns, patterns, and DSA sheets designed to clear top product company interviews.
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-[var(--primary)]" /> Striver's A2Z DSA Course & Sprints</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-[var(--primary)]" /> Company-specific interview question sheets</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-[var(--primary)]" /> Detailed editorial & optimal space-time solutions</li>
            </ul>
          </div>

          <div className="rounded-3xl p-8 bg-[#080811] border border-white/10 relative overflow-hidden">
            <div className="text-3xl text-cyan-400 mb-4"><FaCode /></div>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">12 Months Access</span>
            <h3 className="text-2xl font-black text-white mt-4 mb-3">AlgoVista MERN Stack Full Course</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Become a job-ready Full-Stack Software Engineer with hands-on React, Node.js, Express, MongoDB, Redux Toolkit, JWT auth, WebSockets & cloud deployments.
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-cyan-400" /> 6+ Industry-grade Full Stack Projects</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-cyan-400" /> Advanced backend architecture & API security</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-cyan-400" /> Certificate of Completion & GitHub reviews</li>
            </ul>
          </div>

          <div className="rounded-3xl p-8 bg-[#080811] border border-white/10 relative overflow-hidden">
            <div className="text-3xl text-purple-400 mb-4"><FaLayerGroup /></div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">6 Months Access</span>
            <h3 className="text-2xl font-black text-white mt-4 mb-3">Premium System Design Roadmap</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Master Low Level Design (LLD / OOP design patterns) and High Level Design (HLD / Distributed systems, load balancers, caching, DB sharding).
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-purple-400" /> LLD design patterns (SOLID, Factory, Observer)</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-purple-400" /> Real-world system case studies (Uber, Netflix, WhatsApp)</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-purple-400" /> Interactive diagramming & architecture blueprints</li>
            </ul>
          </div>

          <div className="rounded-3xl p-8 bg-[#080811] border border-white/10 relative overflow-hidden">
            <div className="text-3xl text-emerald-400 mb-4"><FaUsers /></div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">1 Month Access</span>
            <h3 className="text-2xl font-black text-white mt-4 mb-3">Group Mentorship Program</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Get weekly live group interaction with senior software engineers from top tech companies to resolve doubts, refine your resume, and practice mock interviews.
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Weekly live video mentorship calls</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Resume & LinkedIn profile teardowns</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Private Discord community room access</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs text-[var(--primary)] uppercase font-bold tracking-[0.3em] block mb-2">Value Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase">Individual vs AlgoTUF Elite</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#07070e] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 bg-white/[0.03] p-5 font-bold text-xs uppercase tracking-wider border-b border-white/10">
            <div className="col-span-6 text-gray-400">Included Program</div>
            <div className="col-span-3 text-center text-gray-500">Individual Price</div>
            <div className="col-span-3 text-center text-[var(--primary)]">AlgoTUF Elite</div>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            <div className="grid grid-cols-12 p-5 items-center">
              <div className="col-span-6 font-bold text-white">TUF Sprint Package (18 Mo)</div>
              <div className="col-span-3 text-center text-gray-400">₹7,999</div>
              <div className="col-span-3 text-center text-emerald-400 font-bold">INCLUDED</div>
            </div>
            <div className="grid grid-cols-12 p-5 items-center">
              <div className="col-span-6 font-bold text-white">AlgoVista MERN Stack Full Course (12 Mo)</div>
              <div className="col-span-3 text-center text-gray-400">₹5,499</div>
              <div className="col-span-3 text-center text-emerald-400 font-bold">INCLUDED</div>
            </div>
            <div className="grid grid-cols-12 p-5 items-center">
              <div className="col-span-6 font-bold text-white">System Design Premium Roadmap (6 Mo)</div>
              <div className="col-span-3 text-center text-gray-400">₹3,499</div>
              <div className="col-span-3 text-center text-emerald-400 font-bold">INCLUDED</div>
            </div>
            <div className="grid grid-cols-12 p-5 items-center">
              <div className="col-span-6 font-bold text-white">1 Month Live Group Mentorship</div>
              <div className="col-span-3 text-center text-gray-400">₹2,999</div>
              <div className="col-span-3 text-center text-emerald-400 font-bold">INCLUDED</div>
            </div>
            <div className="grid grid-cols-12 p-6 bg-[rgba(250,204,21,0.05)] items-center font-black">
              <div className="col-span-6 text-white text-sm">TOTAL PRICE</div>
              <div className="col-span-3 text-center text-gray-500 line-through text-sm">₹19,996</div>
              <div className="col-span-3 text-center text-[var(--primary)] text-lg">₹5,999 ONLY</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs text-[var(--primary)] uppercase font-bold tracking-[0.3em] block mb-2">Got Questions?</span>
          <h2 className="text-3xl font-black text-white uppercase">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#07070d] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between font-bold text-sm text-white hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <FaChevronDown className={`transition-transform duration-300 text-[var(--primary)] ${openFaq === idx ? "rotate-180" : ""}`} />
              </button>

              {openFaq === idx && (
                <div className="px-6 pb-6 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="w-6 h-6 rounded-full" />
            <span className="text-gray-300 font-bold">AlgoTUF Elite Collaboration</span>
          </div>
          <p>© {new Date().getFullYear()} takeUforward × AlgoVista. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AlgoTufElitePage;
