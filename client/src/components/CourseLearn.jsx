"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tooltip } from "antd";
import {
  AiOutlinePaperClip,
  AiOutlinePlayCircle,
  AiOutlineFilePdf,
  AiOutlineExpand,
  AiOutlineShrink,
} from "react-icons/ai";

const CourseLearn = () => {
  const { id } = useParams();
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("video");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const isPDF = (url) => url?.toLowerCase().endsWith(".pdf");
  const isVideo = (url) => /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(url);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`http://localhost:4000/course/${id}`);
        setCourse(data.course);
        setActiveModule(0);
        setActiveLesson(0);
      } catch (err) {
        console.log("Error loading course:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Guard if course is not set yet
  const modules = course?.modules || [];
  const currentModule = modules.length > 0 ? modules[activeModule] : null;
  const currentLesson =
    currentModule && currentModule.submodules.length > 0
      ? currentModule.submodules[activeLesson]
      : null;

  // Video controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!currentLesson || !currentLesson.videoUrl) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentLesson]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = e.target.value;
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSeekChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = e.target.value;
  };

  const handleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c0c0d] text-white">
        Loading...
      </div>
    );

  if (!course)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Course not found.
      </div>
    );

  // Navigation handlers
  const handleNext = () => {
    if (!currentModule) return;
    if (activeLesson < currentModule.submodules.length - 1) {
      setActiveLesson(activeLesson + 1);
    } else if (activeModule < modules.length - 1) {
      setActiveModule(activeModule + 1);
      setActiveLesson(0);
    }
  };

  const handlePrev = () => {
    if (!currentModule) return;
    if (activeLesson > 0) {
      setActiveLesson(activeLesson - 1);
    } else if (activeModule > 0) {
      const prevLessons = modules[activeModule - 1].submodules.length;
      setActiveModule(activeModule - 1);
      setActiveLesson(prevLessons - 1);
    }
  };

  const getLessonAttachments = () => {
    if (!currentLesson) return [];
    const attachments = [];

    if (currentLesson.videoUrl) {
      attachments.push({
        name: "Lesson Video",
        url: currentLesson.videoUrl,
        type: "video",
      });
    }

    if (currentLesson.pdfUrl) {
      attachments.push({
        name: "Lesson PDF",
        url: currentLesson.pdfUrl,
        type: "pdf",
      });
    }

    return attachments;
  };

  const attachments = getLessonAttachments();

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-[#0b0b0d] text-white flex overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#131317] border-r border-white/10 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Course Contents</h2>

        {modules.map((mod, modIndex) => (
          <div key={modIndex} className="mb-4">
            <button
              className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              onClick={() => {
                setActiveModule(modIndex);
                setActiveLesson(0);
              }}
            >
              <p className="font-semibold">{mod.title}</p>
              <p className="text-xs text-white/50">
                {mod.submodules.length} lessons
              </p>
            </button>

            {activeModule === modIndex && (
              <div className="ml-3 mt-2 space-y-2">
                {mod.submodules.map((lesson, lessonIndex) => (
                  <Tooltip
                    key={lessonIndex}
                    title={lesson.description}
                    placement="right"
                  >
                    <button
                      className={`block w-full text-left px-3 py-2 rounded-lg !ml-4 text-sm ${
                        activeLesson === lessonIndex
                          ? "bg-[#ffffff] text-black"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => setActiveLesson(lessonIndex)}
                    >
                      {lesson.title}
                    </button>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold">{currentLesson ? currentLesson.title : "No Lesson"}</h1>

        {/* Tabs */}
        <div className="flex space-x-6 mt-6 border-b border-white/10 pb-2">
          {["video", "description", "discussion", "attachments", "ai"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize text-sm pb-2 !mr-6 ${
                activeTab === tab
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="mt-6 !ml-4">
          {/* VIDEO PLAYER - NEW TAB */}
          {activeTab === "video" && currentLesson && currentLesson.videoUrl && (
            <div
              ref={videoContainerRef}
              className="bg-[#111113] rounded-xl border border-white/10 overflow-hidden"
            >
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                className="w-full h-96 md:h-[500px] object-contain bg-black"
                preload="metadata"
              />

              {/* Custom Controls */}
              <div className="px-4 py-2 bg-black/80 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={handlePlayPause}
                    className="p-2 hover:bg-white/20 rounded-full transition-all"
                  >
                    <AiOutlinePlayCircle
                      className={`w-8 h-8 ${isPlaying ? "text-red-400" : "text-white"}`}
                    />
                  </button>

                  {/* Progress Bar */}
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-white/70 min-w-[5rem]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer hover:bg-white/30 accent-purple-500"
                      style={{
                        background: `linear-gradient(to right, #9333ea 0%, #9333ea ${
                          (currentTime / duration) * 100
                        }%, transparent ${(currentTime / duration) * 100}%, transparent 100%)`,
                      }}
                    />
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer hover:bg-white/30 accent-purple-500"
                    />
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={handleFullscreen}
                    className="p-2 hover:bg-white/20 rounded-full transition-all"
                  >
                    {isFullscreen ? (
                      <AiOutlineShrink className="w-6 h-6" />
                    ) : (
                      <AiOutlineExpand className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          {activeTab === "description" && (
            <p className="text-white/80 leading-relaxed">
              {currentLesson ? currentLesson.description : "No Description"}
            </p>
          )}

          {/* DISCUSSION */}
          {activeTab === "discussion" && (
            <div>
              <textarea
                placeholder="Ask a doubt..."
                className="w-full bg-[#111113] border border-white/10 rounded-lg p-3 text-sm"
                rows={3}
              />
              <button className="mt-3 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600">
                Post
              </button>
            </div>
          )}

          {/* ATTACHMENTS */}
          {activeTab === "attachments" && (
            <div className="bg-[#111113] p-5 rounded-xl border border-white/10">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AiOutlinePaperClip className="text-purple-400 text-xl" />
                Lesson Resources
              </h2>

              <div className="mt-5 space-y-4">
                {attachments.length > 0 ? (
                  attachments.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#0d0d10] p-4 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                          {res.type === "video" ? (
                            <AiOutlinePlayCircle className="text-purple-400 text-xl" />
                          ) : (
                            <AiOutlineFilePdf className="text-red-500 text-xl" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{res.name}</p>
                          <p className="text-xs text-white/50">
                            {res.type === "video" ? "Video file" : "PDF document"}
                          </p>
                        </div>
                      </div>

                      {res.type === "video" ? (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm whitespace-nowrap"
                        >
                          Open Fullscreen
                        </a>
                      ) : (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm whitespace-nowrap"
                        >
                          Open PDF
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-white/40">No attachments available.</p>
                )}
              </div>
            </div>
          )}

          {/* AI ASSISTANT */}
          {activeTab === "ai" && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#111113]">
              <p className="text-white/70">AI Lesson Assistant Coming Soon…</p>
            </div>
          )}
        </div>

        {/* NEXT / PREV BUTTONS */}
        <div className="flex justify-between mt-10">
          <button
            onClick={handlePrev}
            disabled={activeModule === 0 && activeLesson === 0}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={
              activeModule === modules.length - 1 &&
              currentModule &&
              activeLesson === currentModule.submodules.length - 1
            }
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default CourseLearn;
