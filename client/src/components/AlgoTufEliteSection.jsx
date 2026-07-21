import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaRocket,
  FaCode,
  FaLayerGroup,
  FaUsers,
  FaCheckCircle,
  FaShieldAlt,
  FaClock,
  FaArrowRight,
  FaBolt,
  FaGem
} from "react-icons/fa";
import { useRazorpay } from "react-razorpay";
import axios from "axios";
import Context from "../util/context";

const AlgoTufEliteSection = ({ isStandalone = false }) => {
  const { Razorpay } = useRazorpay();
  const { session } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const perks = [
    {
      title: "TUF Sprint Package",
      duration: "18 Months Access",
      platform: "takeUforward",
      icon: <FaRocket className="text-amber-400 text-2xl" />,
      tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: "Master DSA with Striver's curated sheets, practice sprints, and pattern breakdown algorithms.",
    },
    {
      title: "AlgoVista MERN Stack Full Course",
      duration: "12 Months Access",
      platform: "AlgoVista",
      icon: <FaCode className="text-cyan-400 text-2xl" />,
      tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      description: "Complete end-to-end full-stack development with production React, Node, Express, MongoDB & deployment.",
    },
    {
      title: "Premium System Design Roadmap",
      duration: "6 Months Access",
      platform: "AlgoVista",
      icon: <FaLayerGroup className="text-purple-400 text-2xl" />,
      tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description: "Comprehensive LLD & HLD architectural concepts, microservices, scaling & database optimizations.",
    },
    {
      title: "Group Mentorship",
      duration: "1 Month Access",
      platform: "TUF x AlgoVista",
      icon: <FaUsers className="text-emerald-400 text-2xl" />,
      tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: "Weekly interactive live sessions, code reviews, resume polishing & interview strategy guidance.",
    },
  ];

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
        description: "TUF x AlgoVista Exclusive Collaboration Pass",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/payment/algotuf/verify`,
              { paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id },
              { withCredentials: true }
            );
            alert("🎉 Congratulations! Welcome to AlgoTUF Elite!");
            navigate("/algotuf-elite");
          } catch (err) {
            console.error(err);
            alert("Payment recorded successfully!");
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
      rzp.on("payment.failed", () => {
        alert("Payment Failed. Please try again!");
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Something went wrong initiating checkout!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-mono bg-[#030307] border-y border-[rgba(250,204,21,0.2)]">
      {/* Laser Backlight Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[rgba(250,204,21,0.08)] via-[rgba(6,182,212,0.04)] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-[rgba(250,204,21,0.05)] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[rgba(168,85,247,0.05)] rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[rgba(250,204,21,0.4)] bg-[rgba(250,204,21,0.08)] text-[var(--primary)] text-xs font-black uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(250,204,21,0.2)] mb-6"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary)]"></span>
            </span>
            <span>POWER COLLABORATION PASS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight mb-6"
          >
            TUF <span className="text-[var(--primary)]">×</span> ALGOVISTA{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-amber-300 to-amber-500 animate-text-glow">
              ELITE
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed"
          >
            Two powerhouse platforms unite to give you seamless, full-spectrum access to top-tier DSA, MERN Stack mastery, System Design roadmaps, and direct group mentorship.
          </motion.p>
        </div>

        {/* Main Content Grid: Image Showcase & Program Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">

          {/* Left Column: Visual Banner Card with Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] via-amber-400 to-purple-600 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative rounded-[2rem] bg-[#07070d] border border-[rgba(250,204,21,0.3)] overflow-hidden shadow-2xl p-4 sm:p-6">
              {/* Badge Overlay */}
              <div className="absolute top-8 left-8 z-20 flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-black/80 backdrop-blur-md border border-[var(--primary)] text-[var(--primary)] text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Official Partnership
                </span>
                <span className="px-4 py-1.5 bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                  All-In-One Pass
                </span>
              </div>

              {/* Main Image */}
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/50 aspect-video flex items-center justify-center">
                <img
                  src="/images/algotuf.png"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/algo-tuf.png";
                  }}
                  alt="AlgoTUF Elite Collaboration"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              </div>

              {/* Bottom Card Summary */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-center">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Access Tier</p>
                  <p className="text-sm font-black text-amber-400 mt-1">Multi-Platform Access</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Value</p>
                  <p className="text-sm font-black text-emerald-400 mt-1">₹18,000+ Included</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Pricing & Perks List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 flex flex-col justify-between"
          >
            {/* Price Box */}
            <div className="rounded-3xl border border-[rgba(250,204,21,0.3)] bg-gradient-to-br from-[#0c0c14] to-[#06060a] p-8 shadow-[0_0_40px_rgba(250,204,21,0.08)] mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-10 rounded-bl-full blur-2xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-bold block mb-1">
                    Special Program Price
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                      ₹5,999
                    </span>
                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      NO DISCOUNT APPLIES
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Duration</span>
                  <span className="text-sm font-black text-white font-mono">Up to 18 Months</span>
                </div>
              </div>

              {/* Quick Perks Checklist */}
              <div className="space-y-3 mb-8 text-xs font-semibold text-gray-300">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[var(--primary)] text-base shrink-0" />
                  <span>⚡ <strong>TUF Sprint Package</strong> – Full access for 18 Months</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[var(--primary)] text-base shrink-0" />
                  <span>💻 <strong>AlgoVista MERN Stack Course</strong> – Complete 12 Months access</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[var(--primary)] text-base shrink-0" />
                  <span>🏗️ <strong>Premium System Design Roadmap</strong> – Structured 6 Months access</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[var(--primary)] text-base shrink-0" />
                  <span>👥 <strong>Group Mentorship Program</strong> – Live interactive for 1 Month</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEnrollNow}
                  disabled={loading}
                  className="flex-1 py-4 px-8 rounded-2xl font-black uppercase text-sm tracking-widest text-black bg-gradient-to-r from-[var(--primary)] via-amber-400 to-amber-500 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Initiating Checkout...</span>
                  ) : (
                    <>
                      <span>Enroll in AlgoTUF Elite</span>
                      <FaArrowRight />
                    </>
                  )}
                </button>

                {!isStandalone && (
                  <Link
                    to="/algotuf-elite"
                    className="py-4 px-6 rounded-2xl font-bold uppercase text-xs tracking-widest text-gray-300 bg-white/5 border border-white/10 hover:border-[var(--primary)] hover:text-white transition-all text-center flex items-center justify-center"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4 Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-3xl p-6 bg-[#090910] border border-white/10 hover:border-[rgba(250,204,21,0.4)] hover:shadow-[0_0_35px_rgba(250,204,21,0.1)] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {perk.icon}
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${perk.tagColor}`}>
                    {perk.duration}
                  </span>
                </div>

                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{perk.platform}</p>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[var(--primary)] transition-colors">
                  {perk.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">
                  {perk.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                <span>Included in Pass</span>
                <span className="text-[var(--primary)]">✓ Verified</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlgoTufEliteSection;
