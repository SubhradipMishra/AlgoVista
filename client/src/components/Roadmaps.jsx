import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Skeleton, Tooltip } from "antd";
import { motion } from "framer-motion";
import { PlayCircleOutlined, FilePdfOutlined, TeamOutlined, StarFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Context from "../util/context";
import UserSidebar from "./UserSidebar";

const Roadmaps = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const { session, sessionLoading } = useContext(Context);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // fetch user for sidebar (same pattern as Roadmaps)
  useEffect(() => {
    if (!session?.id) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/auth/user/${session.id}`,
          { withCredentials: true }
        );
        const data = res.data.user || res.data;
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [session]);

  // redirect if not logged in
  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/login");
    }
  }, [session, sessionLoading, navigate]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:4000/course");
      if (res.data.success) {
        setCourses(res.data.courses);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen bg-black text-white overflow-hidden font-mono">
        <UserSidebar
          user={user}
          selectedKey="courses"
          setSelectedKey={() => {}}
          navigate={navigate}
        />
        <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
          <Skeleton.Input
            active
            size="large"
            style={{ width: "40%", marginBottom: "1.5rem" }}
          />
          <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[#111]/80 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-lg"
              >
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
    <div className="flex min-h-screen bg-black text-white overflow-hidden font-mono">
      {user ? (
        <UserSidebar
          user={user}
          selectedKey="courses"
          setSelectedKey={() => {}}
          navigate={navigate}
        />
      ) : (
        <div className="w-64 bg-black" />
      )}

      <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
        {/* Header + small subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Courses
            </h1>
            <p className="text-sm text-gray-400">
              Learn fearlessly, create endlessly.
            </p>
          </div>
        </div>

        {/* Courses grid */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course._id || index}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-[#111]/80 border border-gray-800 rounded-3xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] backdrop-blur-lg transition-all"
            >
              {/* badges */}
              <div className="flex justify-between items-center mb-3 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-black border border-gray-700 px-3 py-1 text-gray-300 uppercase tracking-wide">
                  Popular
                </span>
                <span className="inline-flex items-center rounded-full bg-black border border-gray-700 px-3 py-1 text-gray-300 capitalize">
                  {course.difficultyLevel}
                </span>
              </div>

              {/* title + description */}
              <h2 className="text-xl font-semibold mb-2">
                {course.title}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                {course.description}
              </p>

              {/* meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                <span>⏱ {course.duration}</span>
                <span className="h-1 w-1 rounded-full bg-gray-600" />
                <span className="flex items-center gap-1 text-gray-300">
                  <StarFilled className="text-yellow-400" /> 4.8
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-600" />
                <Tooltip title="Enrolled learners">
                  <span className="flex items-center gap-1 text-gray-300">
                    <TeamOutlined /> 0+ Students
                  </span>
                </Tooltip>
              </div>

              {/* first module preview (if exists) */}
              {course.modules?.[0] && (
                <div className="mb-4">
                  <p className="text-[11px] uppercase text-gray-500 mb-1">
                    First module
                  </p>
                  <p className="text-sm text-gray-200">
                    {course.modules[0].title}
                  </p>
                </div>
              )}

              {/* actions: open first video/pdf */}
              {course.modules?.[0]?.submodules?.[0] && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {course.modules[0].submodules[0].videoUrl && (
                    <a
                      href={course.modules[0].submodules[0].videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-black text-sm font-semibold hover:bg-white transition-colors"
                    >
                      <PlayCircleOutlined /> Watch Intro
                    </a>
                  )}
                  {course.modules[0].submodules[0].pdfUrl && (
                    <a
                      href={course.modules[0].submodules[0].pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-100 text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                      <FilePdfOutlined /> View Notes
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Roadmaps;
