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
  const [enrolled, setEnrolled] = useState([]); // ← user's enrolled courses
  const [loading, setLoading] = useState(true);

  const { session, sessionLoading } = useContext(Context);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/login");
    }
  }, [session, sessionLoading]);

  // Fetch all courses
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
        const res = await axios.get("http://localhost:4000/course-enrollment/course", {
          withCredentials: true,
        });

        // store only enrolled courseIds
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

  // Loading UI
  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen grid-bg text-white overflow-hidden font-mono">
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
    <div className="flex min-h-screen grid-bg text-white overflow-hidden font-mono">

      <UserSidebar user={session?.user} selectedKey="courses" navigate={navigate} />

      <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <p className="text-gray-400">Learn fearlessly, create endlessly.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {courses.map((course) => {
            const isPremium = course.courseType === "premium";
            const isEnrolled = enrolled.includes(course._id); // check enrollment

            return (
              <motion.div
                key={course._id}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-[#1a1a1a]/80 p-6 rounded-3xl border border-gray-800 shadow-xl"
              >
                <div className="relative w-full h-48 mb-4 rounded-2xl overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <h2 className="text-xl font-bold mb-2 truncate">{course.title}</h2>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center gap-3 text-xs mb-6">
                  <span>⏱ {course.duration || "N/A"}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-600" />
                  <span className="flex items-center gap-1">
                    <StarFilled className="text-yellow-400" /> {course.rating || 4.8}
                  </span>
                </div>

                {/* ---------------- BUTTON LOGIC ---------------- */}
                <div className="mt-4">
                  {isEnrolled ? (
                    <Link
                      to={`/courses/${course._id}/learn`}
                      className="block text-center py-4 rounded-2xl font-semibold bg-green-600 hover:bg-green-700"
                    >
                      Continue Learning →
                    </Link>
                  ) : isPremium ? (
                    <Link
                      to={`/courses/${course._id}`}
                      className="block text-center py-4 rounded-2xl font-semibold bg-yellow-500 text-black hover:bg-yellow-600"
                    >
                      Buy Now – ₹{course.discountPrice}
                    </Link>
                  ) : (
                    <Link
                      to={`/courses/${course._id}`}
                      className="block text-center py-4 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700"
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
