"use client";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Skeleton } from "antd";
import { motion } from "framer-motion";
import { StarFilled } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import Context from "../util/context";
import UserSidebar from "./UserSidebar";

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);

  const { session, sessionLoading } = useContext(Context);
  const navigate = useNavigate();

  // ----------------- Redirect if NOT logged in -----------------
  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/login");
    }
  }, [session, sessionLoading]);

  // ----------------- Fetch courses + enrollments -----------------
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:4000/course");
        setCourses(res.data.courses || []);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchEnrolled = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4000/course-enrollment/course",
          { withCredentials: true }
        );

        setEnrolled(res.data.courses.map((c) => c.courseId));
      } catch (error) {
        console.log(error);
      }
    };

    if (session) {
      Promise.all([fetchCourses(), fetchEnrolled()]).then(() => {
        setLoading(false);
      });
    }
  }, [session]);

  // ----------------- Loading UI -----------------
  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen grid-bg text-[var(--text-main)] overflow-hidden font-mono">
        <main className="flex-1 px-8 md:px-16 py-10">
          <Skeleton.Input active size="large" style={{ width: "40%", marginBottom: 20 }} />
          <div className="grid md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} active paragraph={{ rows: 5 }} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-28 relative z-10 font-mono">
        
        {/* Header section */}
        <div className="mb-10 text-center sm:text-left relative">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2 text-xs font-black tracking-widest text-[var(--primary)] uppercase">
            <span>◈ Learn Engineering & Algorithms</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
            Available Courses
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl">
            Acquire deep knowledge, engineer high performance software, and write production grade algorithms.
          </p>
          <div className="h-px bg-gradient-to-r from-[rgba(250,204,21,0.2)] to-transparent mt-6 w-44 mx-auto sm:mx-0" />
        </div>

        {/* Course Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => {
            const isPremium = course.courseType === "premium";
            const isEnrolled = enrolled.includes(course._id);

            return (
              <motion.div
                key={course._id}
                whileHover={{ y: -6 }}
                className={`group relative rounded-3xl p-5 bg-[#07070a]/95 border transition-all duration-500 flex flex-col justify-between overflow-hidden
                  ${
                    isPremium
                      ? "border-[rgba(250,204,21,0.25)] hover:border-[var(--primary)] hover:shadow-[0_0_40px_rgba(250,204,21,0.12)]"
                      : "border-gray-900 hover:border-gray-700"
                  }`}
              >
                {/* HUD Corner Brackets */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[var(--primary)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>

                <div>
                  {/* Thumbnail / Card Cover */}
                  <div className="relative w-full h-40 mb-5 rounded-2xl overflow-hidden border border-gray-900 group-hover:border-[rgba(250,204,21,0.2)] transition-colors duration-300 bg-black">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Badge */}
                    {isPremium ? (
                      <span className="absolute top-3 right-3 text-[9px] font-black tracking-widest text-[var(--primary)] bg-black/80 border border-[rgba(250,204,21,0.3)] px-2.5 py-0.5 rounded-md uppercase">
                        Premium
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 text-[9px] font-black tracking-widest text-green-400 bg-black/80 border border-green-900/30 px-2.5 py-0.5 rounded-md uppercase">
                        Free
                      </span>
                    )}
                  </div>

                  {/* Title & Info */}
                  <h2 className="text-base font-black text-white uppercase tracking-wide truncate group-hover:text-[var(--primary)] transition-colors">
                    {course.title}
                  </h2>
                  <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed min-h-[32px]">
                    {course.description}
                  </p>

                  {/* Stats Stripe */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase mt-4 mb-6">
                    <span className="flex items-center gap-1">⏱ {course.duration || "Self-Paced"}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                    <span className="flex items-center gap-1">
                      <StarFilled className="text-[var(--primary)]" />
                      <span className="text-gray-300">{course.rating || 4.8} Rating</span>
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div>
                  {isEnrolled ? (
                    <Link
                      to={`/courses/${course._id}/learn`}
                      className="block text-center py-3 rounded-xl font-bold uppercase tracking-widest text-xs bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all duration-300"
                    >
                      Continue Learning →
                    </Link>
                  ) : isPremium ? (
                    <Link
                      to={`/courses/${course._id}`}
                      className="block text-center py-3 rounded-xl font-bold uppercase tracking-widest text-xs bg-[var(--primary)] text-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all duration-300"
                    >
                      Buy Now – ₹{course.discountPrice}
                    </Link>
                  ) : (
                    <Link
                      to={`/courses/${course._id}`}
                      className="block text-center py-3 rounded-xl font-bold uppercase tracking-widest text-xs btn-outline text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                      Enroll Free →
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Course;
