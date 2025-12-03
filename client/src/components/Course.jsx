"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Course = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:4000/course");
        setCourses(res.data.courses);
      } catch (error) {
        console.log("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-neutral-900 to-black text-white px-6 py-10">
      <h1 className="text-4xl font-mono font-bold text-center mb-10">
        Available Courses
      </h1>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {courses.map((course) => (
          <motion.div
            key={course._id}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 250 }}
            className="rounded-2xl overflow-hidden bg-neutral-800/40 backdrop-blur-lg shadow-xl border border-neutral-700 hover:border-neutral-500 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative w-full h-52">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="object-cover w-full h-full"
              />

              <span className="absolute top-3 left-3 px-3 py-1 text-xs uppercase font-mono bg-purple-600 text-white rounded-full">
                {course.difficultyLevel}
              </span>

              <span className="absolute top-3 right-3 px-3 py-1 text-xs bg-black/50 font-mono rounded-full">
                {course.modules.length} modules
              </span>
            </div>

            {/* Bottom Content */}
            <div className="p-5 space-y-3">
              <h2 className="text-xl font-mono font-semibold">
                {course.title}
              </h2>

              <p className="text-neutral-400 text-sm">
                {course.description.substring(0, 80)}...
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {course.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-neutral-700 rounded-full font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="mt-3 flex justify-between items-center">
                <div>
                  {course.courseType === "free" ? (
                    <p className="text-green-400 font-semibold">Free</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-300 line-through text-sm">
                        ₹{course.price}
                      </p>
                      <p className="text-purple-400 text-lg font-bold">
                        ₹{course.discountPrice}
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  to={`/courses/${course._id}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-mono"
                >
                  View →
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Course;
