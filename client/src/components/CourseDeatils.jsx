"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  StarFilled, 
  UserOutlined, 
  ClockCircleOutlined, 
  BookOutlined, 
  PlayCircleOutlined 
} from "@ant-design/icons";
import { useContext } from "react";
import Context from "../util/context";

import {useRazorpay} from "react-razorpay" ;
const CourseDetails = () => {

   const {Razorpay} = useRazorpay();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
 const { session, sessionLoading } = useContext(Context);
  const isPDF = (url) => url?.toLowerCase().endsWith(".pdf");



  console.log("session",session);
  const checkEnrollment = async () => {
  try {
    const res = await axios.get(
      "http://localhost:4000/course-enrollment/course",
      { withCredentials: true }
    );

    const enrolledCourses = res.data.courses || [];

    const isEnrolled = enrolledCourses.some((c) => c.courseId === id);

    if (isEnrolled) {
      navigate(`/courses/${id}/learn`);
    }
  } catch (err) {
    console.log("Enrollment check failed:", err);
  }
};

 useEffect(() => {
  const init = async () => {
    try {
      // fetch course
      const { data } = await axios.get(`http://localhost:4000/course/${id}`, {
        withCredentials: true,
      });
      setCourse(data.course || null);

      // check enrollment status
      await checkEnrollment();

    } catch (error) {
      console.log("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  init();
}, [id]);


  // ✅ Enroll user then navigate for FREE course
  const handleFreeCourseStart = async () => {
    try {
      const res = await axios.post(
        "http://localhost:4000/course-enrollment",
        { courseId: id },
        { withCredentials: true }
      );

      console.log("Enrolled:", res.data);

      navigate(`/courses/${id}/learn`); 
    } catch (err) {
      console.log("Enrollment error:", err);
    }
  };

  // Paid course → Checkout page
  const handleBuyNow = async(course) =>{
   

    try{

       const {data} = await axios.post(
        "http://localhost:4000/payment/course/order",
        { productId: course._id },
        { withCredentials: true }
      );

      console.log(data);

      const options = {
        key: "rzp_test_SrKIlIS4UjIGK5",
        amount:data.amount ,
        currency:"INR",
      name:"AlgoVista",
      description:course.title,
       order_id:data.id,
      handler:(response)=>{
        alert("Payment Successfull");
      },
      prefill:{ 
        name:session.fullname,
        email:session.email,
        contact:"5647484939"
      },
      theme:{
         color:"#f37254"
      },

      notes:{
        name:session.fullname,
        user:session.id,
        product:course._id,
        discount:course.discountPrice,
      }
      }

       const rzp =  new Razorpay(options) ;
   rzp.open() ;


    rzp.on("payment.failed",()=>{
    alert("Payment Failed!")
   })

    }


    catch (err) {
    console.log(err);
    if(err.status === 401)
      return navigate("/login");
    console.error("Payment order failed:", err);
  }



  };

  const handlePreview = () => navigate(`/course/${id}/preview`);

  if (loading) {
    return (
      <div className="flex min-h-screen grid-bg text-white items-center justify-center font-mono">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm tracking-widest uppercase">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen grid-bg text-white items-center justify-center font-mono">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Course not found</p>
          <button 
            onClick={() => navigate('/courses')}
            className="px-6 py-2 bg-purple-600/90 hover:bg-purple-700 rounded-xl font-mono tracking-wide border border-purple-500/50"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.submodules?.length || 0), 0) || 0;
  const isFree = course.courseType === "free";
  const instructors = course.instructor?.[0] ? JSON.parse(course.instructor[0]).join(", ") : "TBA";
  const prerequisites = course.prerequisits || [];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 pt-28 relative z-10 font-mono">
        
        {/* ================= BACK NAVIGATION ================= */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-xs font-black tracking-widest text-gray-400 hover:text-[var(--primary)] uppercase transition-colors"
          >
            <span>← Back to Courses</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-[2.2fr_1fr] gap-12 items-start">

          {/* Main Section */}
          <div className="space-y-8">

            {/* Course Hero */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden border border-[rgba(250,204,21,0.15)] bg-black shadow-[0_0_50px_rgba(250,204,21,0.03)] group"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-[280px] lg:h-[360px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-black/80 text-[10px] font-black uppercase tracking-wider rounded-md border border-[rgba(250,204,21,0.3)] text-[var(--primary)]">
                  {course.difficultyLevel}
                </span>
                {course.certificateAvailable && (
                  <span className="px-4 py-1.5 bg-green-950/80 text-[10px] font-black uppercase tracking-wider rounded-md border border-green-900/30 text-green-400">
                    Certificate Included
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2 bg-black/80 border border-gray-900 px-4 py-2 rounded-full">
                  <ClockCircleOutlined className="text-[var(--primary)]" />
                  <span>{course.duration} Duration</span>
                </div>
                <div className="flex items-center gap-2 bg-black/80 border border-gray-900 px-4 py-2 rounded-full">
                  <BookOutlined className="text-[var(--primary)]" />
                  <span>{course.modules?.length || 0} Modules · {totalLessons} Lessons</span>
                </div>
              </div>
            </motion.div>

            {/* Title & Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white uppercase tracking-wide">
                {course.title}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Tags */}
              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-bold text-amber-300/80 bg-black/60 border border-[rgba(250,204,21,0.15)] px-3 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Instructor */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/90 p-8 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(250,204,21,0.01)] rounded-full blur-xl pointer-events-none"></div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2.5 text-white border-b border-gray-900 pb-3">
                <UserOutlined className="text-[var(--primary)]" />
                Featured Instructor
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black border border-[rgba(250,204,21,0.2)] rounded-2xl flex items-center justify-center text-xl font-black text-[var(--primary)] shadow-md">
                  {instructors.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-bold text-white uppercase tracking-wide">{instructors}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-semibold">
                    <StarFilled className="text-[var(--primary)]" />
                    <span>{course.rating || 4.8} rating · ({course.numReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/90 p-8 shadow-sm"
              >
                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-[var(--primary)] border-b border-gray-900 pb-3">
                  Prerequisites & Background
                </h3>
                <ul className="space-y-3.5 text-xs font-semibold">
                  {prerequisites.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="text-[var(--primary)] font-bold">◈</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Learning Outcomes */}
            {course.outCome?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/90 p-8 shadow-sm"
              >
                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-[var(--primary)] border-b border-gray-900 pb-3">
                  What You'll Learn
                </h3>
                <ul className="space-y-3.5 text-xs font-semibold">
                  {course.outCome.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="text-green-400 font-bold">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

          </div>

          {/* ───────── SIDEBAR ───────── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 space-y-6"
          >

            {/* Price Card */}
            <div className="rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/90 p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[rgba(250,204,21,0.01)] rounded-full blur-xl pointer-events-none"></div>

              <div className="space-y-4 mb-8">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Course Offering</p>

                {isFree ? (
                  <p className="text-5xl font-black text-green-400 tracking-wider">FREE</p>
                ) : (
                  <div className="space-y-1">
                    <span className="text-xs line-through text-gray-600 font-bold font-mono">₹{course.price}</span>
                    <p className="text-4xl font-black text-white">₹{course.discountPrice}</p>
                  </div>
                )}
              </div>

              {/* CTA BUTTON */}
              {isFree ? (
                <button
                  onClick={handleFreeCourseStart}
                  className="w-full py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest bg-green-500/10 border border-green-500/40 text-green-400 hover:bg-green-500/20 shadow-md transition-all duration-300"
                >
                  Start Learning Free
                </button>
              ) : (
                <button
                  onClick={() => handleBuyNow(course)}
                  className="w-full py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest bg-[var(--primary)] text-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all duration-300"
                >
                  Buy Now - ₹{course.discountPrice}
                </button>
              )}

              {!isFree && (
                <button
                  onClick={handlePreview}
                  className="w-full mt-4 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-800 text-gray-400 hover:text-white hover:border-white transition-all duration-300"
                >
                  <PlayCircleOutlined className="inline-block mr-2 text-[var(--primary)]" />
                  Watch Preview
                </button>
              )}

              <div className="h-px bg-gray-900 my-6" />

              {/* Course Stats */}
              <div className="space-y-3.5 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Language</span>
                  <span className="text-white font-mono">{course.language}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Category</span>
                  <span className="text-white">{course.category}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Views</span>
                  <span className="text-white font-mono">{course.views || 0}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Students</span>
                  <span className="text-white font-mono">
                    {course.enrolledUsers?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="rounded-3xl border border-[rgba(250,204,21,0.1)] bg-[#07070a]/90 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-900">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--primary)] flex items-center gap-2">
                  <BookOutlined />
                  Learning Roadmap
                </h3>
              </div>
              <div className="relative border-b border-gray-900">
                {isPDF(course.roadmapImage) ? (
                  <iframe
                     src={course.roadmapImage}
                     title="Roadmap"
                     className="w-full h-80 border-none"
                  />
                ) : (
                  <img
                    src={course.roadmapImage}
                    alt="Roadmap"
                    className="w-full h-64 object-cover"
                  />
                )}
              </div>
              <div className="p-4 bg-black/60">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Visual roadmap of your learning journey</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ───────── COURSE CONTENT SECTION ───────── */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <div className="text-center mb-12 relative">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
              Course Curriculum
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(250,204,21,0.2)] to-transparent mt-4 w-64 mx-auto" />
          </div>

          {isFree ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-[rgba(250,204,21,0.15)] bg-black/40">
              <h3 className="text-xl font-black mb-3 text-[var(--primary)] uppercase tracking-wider">Ready to Start?</h3>
              <p className="text-xs text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
                Click "Start Learning Free" above to unlock all modules and begin your journey.
              </p>
              <button
                onClick={handleFreeCourseStart}
                className="px-12 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-green-500/10 border border-green-500/40 text-green-400 hover:bg-green-500/20 transition-all duration-300"
              >
                Access All Content
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.modules.slice(0, 6).map((module, index) => (
                <motion.div
                  key={module._id || index}
                  whileHover={{ y: -4 }}
                  className="group rounded-3xl border border-[rgba(250,204,21,0.12)] bg-[#07070a]/95 p-6 hover:border-[var(--primary)] hover:shadow-[0_0_30px_rgba(250,204,21,0.08)] transition-all duration-500 cursor-pointer"
                  onClick={handleBuyNow}
                >
                  <h4 className="font-bold text-base text-white uppercase tracking-wider group-hover:text-[var(--primary)] transition-colors mb-3">
                    {module.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-6">{module.submodules?.length || 0} Lessons</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-black border border-gray-900 px-3 py-1 rounded font-bold uppercase tracking-wider text-gray-600">
                      Locked
                    </span>
                    <span className="text-[10px] font-bold text-[var(--primary)] hover:text-white transition-colors uppercase tracking-widest">
                      Unlock →
                    </span>
                  </div>
                </motion.div>
              ))}

              {course.modules.length > 6 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="md:col-span-2 lg:col-span-3 p-12 border border-dashed border-[rgba(250,204,21,0.15)] rounded-3xl text-center bg-black/40 transition-all cursor-pointer"
                  onClick={handleBuyNow}
                >
                  <p className="text-xl font-black mb-3 text-[var(--primary)] uppercase tracking-wider">
                    +{course.modules.length - 6} More Modules Available
                  </p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">
                    Purchase this premium course to unlock complete curriculum
                  </p>
                  <button className="px-8 py-3.5 bg-[var(--primary)] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all">
                    Get Full Access
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default CourseDetails;
