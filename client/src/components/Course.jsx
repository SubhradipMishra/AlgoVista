"use client";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Skeleton, Tooltip } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Icons from Ant Design
import {
  StarFilled,
  TeamOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";

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
        const res = await axios.get(
          `http://localhost:4000/auth/user/${session.id}`,
          { withCredentials: true }
        );
        setUser(res.data.user || res.data);
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
  }, [session, sessionLoading]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:4000/course");
        if (res.data.success) setCourses(res.data.courses);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen bg-black text-white font-mono">
        <UserSidebar
          user={user}
          selectedKey="courses"
          setSelectedKey={() => {}}
          navigate={navigate}
        />
        <main className="flex-1 p-10 overflow-y-auto">
          <Skeleton.Input
            active
            size="large"
            style={{ width: "30%", marginBottom: "1.5rem" }}
          />
          <div className="grid md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#111]/80 border border-gray-800 rounded-2xl p-6 shadow-lg"
              >
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-black text-white font-mono">
      <UserSidebar
        user={user}
        selectedKey="courses"
        setSelectedKey={() => {}}
        navigate={navigate}
      />

      <main className="flex-1 px-10 md:px-16 py-10 overflow-y-auto">
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-3xl font-bold tracking-wide">Courses</h1>
          <p className="text-gray-400 text-sm">
            Explore curated courses to level up your skills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {courses.map((course) => (
            <motion.div
              whileHover={{
                scale: 1.04,
                y: -3,
                boxShadow: "0px 0px 30px rgba(0, 102, 255, 0.25)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              key={course._id}
              className="bg-[#080808] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl"
            >
              <div className="flex justify-between">
                <span className="px-2 py-1 text-[11px] rounded-full border border-blue-700 text-blue-400">
                  Featured
                </span>
                <span className="px-2 py-1 text-[11px] rounded-full border border-gray-700 text-gray-300 capitalize">
                  {course.difficultyLevel}
                </span>
              </div>

              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                {course.description}
              </p>

              <div className="flex items-center text-xs gap-3 text-gray-400">
                <span>⏱ {course.duration}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="flex items-center gap-1 text-blue-400">
                  <StarFilled /> 4.8
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <Tooltip title="Enrolled learners">
                  <span className="flex items-center gap-1 text-gray-300">
                    <TeamOutlined /> 0+ Students
                  </span>
                </Tooltip>
              </div>

              {course.modules?.length > 0 && (
                <p className="text-gray-300 text-sm">
                  <span className="uppercase text-gray-500 text-[10px]">
                    First Module:
                  </span>{" "}
                  {course.modules[0]?.title}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                {course.modules?.[0]?.submodules?.[0]?.videoUrl && (
                  <button
                    onClick={() => navigate(`/course/${course._id}/learn`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-semibold text-sm transition-all"
                  >
                    <PlayCircleOutlined /> Start Learning
                  </button>
                )}

                {course.modules?.[0]?.submodules?.[0]?.pdfUrl && (
                  <a
                    href={course.modules[0].submodules[0].pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 font-semibold text-sm"
                  >
                    <FilePdfOutlined /> Notes
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Course;
