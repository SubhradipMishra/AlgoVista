"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPDF = (url) => url?.toLowerCase().endsWith(".pdf");


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`http://localhost:4000/course/${id}`);
        setCourse(data.course || null);
      } catch (error) {
        console.log("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleModule = (index) => {
    setActiveModuleIndex((prev) => (prev === index ? null : index));
  };

  const handleAccessContent = () => {
    // For free course, navigate to a learning page or unlock flow
    navigate(`/course/${id}/learn`);
  };

  const handleBuyNow = () => {
    // For paid course, navigate to checkout
    navigate(`/checkout/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center font-mono">
        <p className="text-sm tracking-widest uppercase">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center font-mono">
        <p className="text-sm tracking-widest uppercase">Course not found.</p>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce(
    (acc, mod) => acc + (mod.submodules?.length || 0),
    0
  );

  const isFree = course.courseType === "free";

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.04),_transparent_55%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />

      {/* Page container */}
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10 lg:py-14">
        {/* Top: hero section */}
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8 lg:gap-10 items-start">
          {/* Left: hero + description */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)]">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-[260px] md:h-[320px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              {/* Difficulty */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 text-[10px] md:text-xs uppercase tracking-[0.18em] bg-black/70 border border-white/30 rounded-full">
                  {course.difficultyLevel}
                </span>
                {course.certificateAvailable && (
                  <span className="px-3 py-1 text-[10px] md:text-xs uppercase tracking-[0.18em] bg-black/60 border border-white/30 rounded-full">
                    Certificate
                  </span>
                )}
              </div>
              {/* Stats bottom */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  {course.language}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  {course.modules?.length || 0} modules • {totalLessons} lessons
                </span>
              </div>
            </div>

            {/* Title + description + tags */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {course.title}
              </h1>
              <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {course.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-[11px] uppercase tracking-[0.18em] bg-white/5 border border-white/15 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What you'll learn / Outcomes */}
            {course.outCome && course.outCome.length > 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/70 px-5 py-4">
                <h2 className="text-sm md:text-base font-semibold mb-3 tracking-[0.16em] uppercase">
                  What you will learn
                </h2>
                <ul className="space-y-2 text-xs md:text-sm text-white/70">
                  {course.outCome.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/50 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: pricing / metadata card */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/80 px-6 py-6 flex flex-col gap-5 shadow-[0_0_40px_rgba(0,0,0,0.85)]">
              <div className="space-y-1">
                <p className="text-xs tracking-[0.2em] uppercase text-white/60">
                  Course price
                </p>
                {isFree ? (
                  <p className="text-3xl font-extrabold leading-tight">Free</p>
                ) : (
                  <div className="flex items-end gap-3">
                    <span className="text-base line-through text-white/40">
                      ₹{course.price}
                    </span>
                    <span className="text-3xl font-extrabold leading-tight">
                      ₹{course.discountPrice}
                    </span>
                  </div>
                )}
              </div>

              {isFree ? (
                <button
                  onClick={handleAccessContent}
                  className="w-full mt-2 py-3 rounded-2xl text-sm md:text-base font-semibold tracking-[0.18em] uppercase bg-white text-black hover:bg-black hover:text-white border border-white transition-colors duration-300"
                >
                  Access content
                </button>
              ) : (
                <button
                  onClick={handleBuyNow}
                  className="w-full mt-2 py-3 rounded-2xl text-sm md:text-base font-semibold tracking-[0.18em] uppercase bg-white text-black hover:bg-black hover:text-white border border-white transition-colors duration-300"
                >
                  Buy now
                </button>
              )}

              {!isFree && (
                <button
                  onClick={() => navigate(`/course/${id}/preview`)}
                  className="w-full py-3 rounded-2xl text-xs md:text-sm tracking-[0.18em] uppercase border border-white/40 text-white/80 hover:bg-white hover:text-black transition-colors duration-300"
                >
                  Watch trailer
                </button>
              )}

              <div className="h-px bg-white/10" />

              <div className="space-y-3 text-xs text-white/70">
                <div className="flex items-center justify-between">
                  <span>Difficulty</span>
                  <span className="text-white">{course.difficultyLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Language</span>
                  <span className="text-white">{course.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="text-white">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Category</span>
                  <span className="text-white">
                    {course.category || "General"}
                  </span>
                </div>
              </div>
            </div>

            {/* Roadmap image card */}
           {/* Roadmap image/pdf card */}
<div className="rounded-3xl border border-white/10 bg-black/80 overflow-hidden">
  <div className="px-6 pt-5 pb-3">
    <h3 className="text-sm font-semibold tracking-[0.18em] uppercase">
      Roadmap
    </h3>
  </div>

  <div className="border-t border-white/10">
    {isPDF(course.roadmapImage) ? (
      <iframe
        src={course.roadmapImage}
        title="Roadmap PDF"
        className="w-full h-72 border-none"
      ></iframe>
    ) : (
      <img
        src={course.roadmapImage}
        alt="Roadmap"
        className="w-full h-56 object-cover"
      />
    )}
  </div>

  <div className="px-6 py-4">
    <p className="text-xs text-white/70">
      A high-level path of modules and outcomes covered in this course.
    </p>
  </div>
</div>

          </aside>
        </div>

        {/* Bottom: Course content */}
        {isFree ? (
          <section className="mt-10 lg:mt-14">
            <div className="rounded-3xl border border-white/10 bg-black/70 p-6 text-center">
              <h2 className="text-lg md:text-xl font-semibold tracking-[0.16em] uppercase">
                Course content locked
              </h2>
              <p className="mt-2 text-sm text-white/70">
                This is a free course. Click “Access content” to start learning.
              </p>
              <button
                onClick={handleAccessContent}
                className="mt-5 px-6 py-3 rounded-2xl text-sm uppercase tracking-[0.18em] bg-white text-black hover:bg-black hover:text-white border border-white transition-colors duration-300"
              >
                Access content
              </button>
            </div>
          </section>
        ) : (
          <section className="mt-10 lg:mt-14">
            <h2 className="text-lg md:text-xl font-semibold mb-4 tracking-[0.16em] uppercase">
              Course content
            </h2>

            <div className="rounded-3xl border border-white/10 bg-black/70 divide-y divide-white/10">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module, index) => {
                  const lessonCount = module.submodules?.length || 0;
                  return (
                    <div key={module._id || index}>
                      <button
                        type="button"
                        onClick={() => toggleModule(index)}
                        className="w-full flex items-center justify-between px-5 md:px-6 py-4 md:py-5 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm md:text-base font-semibold">
                            {module.title}
                          </span>
                          <span className="text-[11px] md:text-xs text-white/55 mt-1">
                            {lessonCount} lessons
                          </span>
                        </div>
                        <span className="text-xl select-none">
                          {activeModuleIndex === index ? "▴" : "▾"}
                        </span>
                      </button>

                      {activeModuleIndex === index && (
                        <div className="px-5 md:px-6 pb-4 md:pb-5 space-y-3 bg-black">
                          {module.submodules?.map((sub, i) => (
                            <div
                              key={sub._id || i}
                              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-white/10 rounded-2xl px-4 py-3 text-xs md:text-sm"
                            >
                              <div>
                                <p className="font-semibold">{sub.title}</p>
                                <p className="text-white/60 mt-1 text-[11px] md:text-xs">
                                  {sub.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] md:text-xs">
                                <button
                                  onClick={handleBuyNow}
                                  className="px-3 py-1 rounded-xl border border-white/40 hover:bg-white hover:text-black transition-colors"
                                >
                                  Buy to unlock
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-6 text-sm text-white/60">
                  Course modules will be available soon.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
