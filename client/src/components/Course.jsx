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
  const [loading, setLoading] = useState(true);

  const { session, sessionLoading } = useContext(Context);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.id) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/auth/user/${session.id}`, { withCredentials: true });
        const data = res.data.user || res.data;
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [session]);

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/login");
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:4000/course");
        if (res.data.success || res.data.courses) {
          setCourses(res.data.courses || []);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen grid-bg text-white overflow-hidden font-mono">
        <UserSidebar user={user} selectedKey="courses" setSelectedKey={() => {}} navigate={navigate} />
        <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
          <Skeleton.Input active size="large" style={{ width: "40%", marginBottom: "1.5rem" }} />
          <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a]/80 border border-gray-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen grid-bg text-white overflow-hidden font-mono">
      {user ? (
        <UserSidebar user={user} selectedKey="courses" setSelectedKey={() => {}} navigate={navigate} />
      ) : (
        <div className="w-64 bg-black" />
      )}

      <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Available Courses</h1>
            <p className="text-sm text-gray-400">Learn fearlessly, create endlessly.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
          {courses.map((course) => {
            const isPremium = course.courseType === "premium";
            return (
              <motion.div
                key={course._id}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`group rounded-3xl p-6 backdrop-blur-sm transition-all cursor-pointer border-2 shadow-xl ${
                  isPremium
                    ? "bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-yellow-900/20 border-yellow-500/40 hover:border-yellow-400/60 shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:shadow-[0_0_35px_rgba(255,215,0,0.4)]"
                    : "bg-[#1a1a1a]/80 border-gray-800/50 hover:border-gray-600/60 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 mb-4 rounded-2xl overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${
                        isPremium
                          ? "bg-yellow-600/90 border-yellow-500 text-white shadow-lg shadow-yellow-500/25"
                          : "bg-black/90 border-gray-700 text-gray-300 shadow-sm"
                      }`}
                    >
                      {isPremium ? "Premium" : "Free"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-black/90 border border-gray-700/70 px-3 py-1 text-xs text-gray-300">
                      {course.modules.length} modules
                    </span>
                  </div>
                  {/* Premium ribbon */}
                  {isPremium && (
                    <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rotate-45 flex items-center justify-center">
                      <span className="text-xs font-bold text-black -rotate-45">★ GOLD</span>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h2
                  className={`text-xl font-bold mb-2 truncate ${
                    isPremium ? "text-yellow-400 drop-shadow-sm" : "text-gray-100"
                  }`}
                >
                  {course.title}
                </h2>
                <p className={`text-sm mb-4 line-clamp-2 ${isPremium ? "text-yellow-200" : "text-gray-400"}`}>
                  {course.description}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 text-xs mb-6">
                  <span className="flex items-center gap-1">⏱ {course.duration || "N/A"}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-600" />
                  <span className={`flex items-center gap-1 ${isPremium ? "text-yellow-300" : "text-gray-300"}`}>
                    <StarFilled className="text-yellow-400" /> {course.rating || 4.8}
                  </span>
                </div>

                {/* Price & View Course Button */}
                <div className="space-y-3">
                  {isPremium ? (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-yellow-400">₹{course.discountPrice}</span>
                        <span className="text-sm line-through text-gray-500">₹{course.price}</span>
                      </div>
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 text-xs font-bold text-black rounded-full shadow-md">
                        Save {Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-gray-300">FREE</span>
                    </div>
                  )}

                  <Link
                    to={`/courses/${course._id}`}
                    className={`w-full block text-center py-4 px-6 rounded-2xl font-mono font-semibold text-sm uppercase tracking-wider shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                      isPremium
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border border-yellow-500/70 hover:from-yellow-500 hover:to-yellow-700 hover:shadow-yellow-500/40 hover:border-yellow-600/90"
                        : "bg-gray-900/80 text-white border border-gray-700 hover:bg-gray-900/90 hover:shadow-gray-700/50"
                    }`}
                    aria-label={`View ${course.title}`}
                  >
                    {isPremium ? "Get Gold Access" : "Start Free Course"}
                  </Link>
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
