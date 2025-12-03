"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});

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

  const toggleFlip = (courseId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-6 py-10 relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50"></div>

      <h1 className="text-4xl font-bold text-center mb-16 relative z-10 tracking-widest border-b border-white/10 pb-6 max-w-2xl mx-auto">
        Available Courses
      </h1>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto relative z-10">
        {courses.map((course) => (
          <motion.div
            key={course._id}
            className="group perspective-1000"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Flip Card Container */}
            <div
              className="relative w-full h-[400px] rounded-3xl shadow-2xl shadow-black/50 group-hover:shadow-white/10 transition-all duration-500 border border-white/5 hover:border-white/20 overflow-hidden cursor-pointer"
              style={{ perspective: "1000px" }}
              onMouseEnter={() => toggleFlip(course._id)}
              onMouseLeave={() => toggleFlip(course._id)}
            >
              <div
                className="relative w-full h-full transition-transform duration-700"
                style={{
                  transform: flippedCards[course._id]
                    ? "rotateY(180deg)"
                    : "rotateY(0deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* FRONT SIDE */}
                <motion.div
                  className="absolute inset-0 rounded-3xl overflow-hidden bg-black/90 border border-white/10 backdrop-blur-sm"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="relative w-full h-56 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Difficulty Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 text-xs uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-bold">
                        {course.difficultyLevel}
                      </span>
                    </div>

                    {/* Modules Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 text-xs bg-black/60 backdrop-blur-sm border border-white/20 text-white rounded-full font-mono">
                        {course.modules.length} modules
                      </span>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>

                  {/* FRONT CONTENT */}
                  <div className="p-8 space-y-4">
                    <h2 className="text-2xl font-bold leading-tight line-clamp-2 group-hover:text-white/90 transition-colors">
                      {course.title}
                    </h2>

                    <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                      {course.description.substring(0, 80)}...
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {course.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs bg-white/5 border border-white/20 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="pt-4 border-t border-white/10">
                      {course.courseType === "free" ? (
                        <p className="text-white font-bold text-lg tracking-wide">
                          FREE
                        </p>
                      ) : (
                        <div className="flex items-baseline gap-3">
                          <span className="text-white/50 text-sm line-through font-mono">
                            ₹{course.price}
                          </span>
                          <span className="text-xl font-black tracking-wider">
                            ₹{course.discountPrice}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* BACK SIDE */}
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-black/95 backdrop-blur-xl border border-white/15 p-8 flex flex-col justify-between shadow-2xl shadow-black/50"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {/* Roadmap Image */}
                  <div className="mb-6">
                    <div className="w-full h-32 rounded-2xl overflow-hidden border border-white/10 mb-4">
                      <img
                        src={course.roadmapImage}
                        alt="Roadmap"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-20 font-bold text-white/80">
                          Language:
                        </span>
                        <span className="text-white/70">
                          {course.language}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-20 font-bold text-white/80">
                          Duration:
                        </span>
                        <span className="text-white/70 font-mono">
                          {course.duration}
                        </span>
                      </div>
                    </div>

                    {/* Prerequisites */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">
                          Prerequisites
                        </h4>
                        <ul className="space-y-1 text-white/60 text-xs ml-2 max-h-16 overflow-y-auto">
                          {course.prerequisits?.slice(0, 3).map((p, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Outcomes */}
                      <div>
                        <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">
                          Outcomes
                        </h4>
                        <ul className="space-y-1 text-white/60 text-xs ml-2 max-h-16 overflow-y-auto">
                          {course.outCome?.slice(0, 3).map((o, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={`/course/${course._id}`}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white font-bold py-3.5 px-6 rounded-2xl text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 flex items-center justify-center gap-2"
                    >
                      View Course →
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Course;
