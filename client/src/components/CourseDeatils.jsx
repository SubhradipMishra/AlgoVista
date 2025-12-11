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
        "http://localhost:4000/payment/order",
        { productId: course._id },
        { withCredentials: true }
      );

      console.log(data);

      const options = {
        key:"rzp_test_RpG7PsiR24EZK5",
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
    <div className="min-h-screen grid-bg text-white font-mono overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:px-8 lg:py-16">

        <div className="grid lg:grid-cols-[2.2fr_1fr] gap-12 items-start">

          {/* Main Section */}
          <div className="space-y-8">

            {/* Course Hero */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden border border-gray-800/50 bg-[#1a1a1a] shadow-xl"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-[280px] lg:h-[360px] object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-purple-600/80 text-xs font-bold uppercase tracking-wider rounded-full border border-purple-500/50">
                  {course.difficultyLevel}
                </span>
                {course.certificateAvailable && (
                  <span className="px-4 py-2 bg-green-600/80 text-xs font-bold uppercase tracking-wider rounded-full border border-green-500/50">
                    Certificate
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2 bg-black/80 px-3 py-1 rounded-full">
                  <ClockCircleOutlined className="text-purple-400" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2 bg-black/80 px-3 py-1 rounded-full">
                  <BookOutlined className="text-purple-400" />
                  {course.modules?.length || 0} Modules • {totalLessons} Lessons
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
              <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white">
                {course.title}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Tags */}
              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-2xl text-sm font-medium text-purple-300 hover:bg-purple-500/20 transition-all"
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
              className="rounded-3xl border border-gray-700/50 bg-[#1a1a1a]/80 p-8 backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                <UserOutlined className="text-xl text-purple-400" />
                Instructor
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600/80 to-purple-700/80 rounded-2xl flex items-center justify-center text-2xl font-bold text-white border-2 border-purple-500/50">
                  {instructors.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{instructors}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <StarFilled className="text-yellow-400" />
                    <span>{course.rating || 0} ({course.numReviews || 0} reviews)</span>
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
                className="rounded-3xl border border-gray-700/50 bg-[#1a1a1a]/80 p-8 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-purple-300">
                  Prerequisites
                </h3>
                <ul className="space-y-3">
                  {prerequisites.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      {req}
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
                className="rounded-3xl border border-gray-700/50 bg-[#1a1a1a]/80 p-8 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-purple-300">
                  What You'll Learn
                </h3>
                <ul className="space-y-3">
                  {course.outCome.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      {outcome}
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
            <div className="rounded-3xl border-2 border-gray-700/50 bg-[#1a1a1a]/90 backdrop-blur-sm p-8 shadow-xl">
              <div className="space-y-4 mb-8">
                <p className="text-xs uppercase tracking-widest text-purple-400">Course Price</p>

                {isFree ? (
                  <p className="text-5xl lg:text-6xl font-black text-green-400">FREE</p>
                ) : (
                  <div className="space-y-2">
                    <span className="text-2xl line-through text-gray-500">₹{course.price}</span>
                    <p className="text-5xl lg:text-6xl font-black text-white">₹{course.discountPrice}</p>
                  </div>
                )}
              </div>

              {/* CTA BUTTON */}
              {isFree ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFreeCourseStart}
                  className="w-full py-5 px-6 rounded-3xl text-xl font-bold uppercase tracking-wider bg-green-600 text-white hover:bg-green-700 border border-green-500/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                >
                  Start Learning Free
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBuyNow(course)}

                  className="w-full py-5 px-6 rounded-3xl text-xl font-bold uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-700 border border-purple-500/50 shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  Buy Now - ₹{course.discountPrice}
                </motion.button>
              )}

              {!isFree && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handlePreview}
                  className="w-full mt-4 py-3 px-4 rounded-2xl text-sm font-bold uppercase tracking-wider border-2 border-gray-600/50 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 hover:text-purple-300 transition-all duration-300"
                >
                  <PlayCircleOutlined className="inline-block mr-2" />
                  Watch Preview
                </motion.button>
              )}

              <div className="h-px bg-gray-700/50 my-6" />

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-500">Language</span>
                  <span className="font-bold ml-auto text-white">{course.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-500">Category</span>
                  <span className="font-bold ml-auto text-white">{course.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-500">Views</span>
                  <span className="font-bold ml-auto text-white">{course.views || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-gray-500">Students</span>
                  <span className="font-bold ml-auto text-white">
                    {course.enrolledUsers?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="rounded-3xl border-2 border-gray-700/50 bg-[#1a1a1a]/90 backdrop-blur-sm overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-lg font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <BookOutlined />
                  Learning Roadmap
                </h3>
              </div>
              <div className="relative">
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
                    className="w-full h-72 lg:h-80 object-cover"
                  />
                )}
              </div>
              <div className="p-6 bg-gray-800/50 border-t border-gray-700/50">
                <p className="text-sm text-gray-400">Visual roadmap of your learning journey</p>
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
          <h2 className="text-3xl font-black mb-12 text-center uppercase tracking-wider text-white">
            Course Curriculum
          </h2>

          {isFree ? (
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-purple-500/30 bg-purple-500/5">
              <h3 className="text-2xl font-bold mb-4 text-purple-400">Ready to Start?</h3>
              <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
                Click "Start Learning Free" above to unlock all modules and begin your journey.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleFreeCourseStart}
                className="px-12 py-5 rounded-3xl text-xl font-bold uppercase tracking-wider bg-green-600 text-white hover:bg-green-700 border border-green-500/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                Access All Content
              </motion.button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.modules.slice(0, 6).map((module, index) => (
                <motion.div
                  key={module._id || index}
                  whileHover={{ y: -4 }}
                  className="group rounded-3xl border border-gray-700/50 bg-[#1a1a1a]/80 p-8 backdrop-blur-sm hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer"
                  onClick={handleBuyNow}
                >
                  <h4 className="font-bold text-lg mb-4 group-hover:text-purple-400 transition-colors">
                    {module.title}
                  </h4>
                  <p className="text-sm text-gray-400 mb-6">{module.submodules?.length || 0} Lessons</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-500/20 px-3 py-1 rounded-full font-medium text-purple-400 border border-purple-500/30">
                      Preview Locked
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 shadow-md group-hover:shadow-purple-500/30 transition-all"
                    >
                      Unlock Module
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {course.modules.length > 6 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="md:col-span-2 lg:col-span-3 p-12 border-2 border-dashed border-gray-600/50 rounded-3xl text-center hover:border-purple-500/50 bg-gray-800/30 transition-all cursor-pointer"
                  onClick={handleBuyNow}
                >
                  <p className="text-2xl font-bold mb-4 text-purple-400">
                    +{course.modules.length - 6} More Modules
                  </p>
                  <p className="text-gray-400 mb-6">
                    Purchase to unlock complete curriculum
                  </p>
                  <button className="px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl uppercase tracking-wider hover:bg-purple-700 border border-purple-500/50 shadow-lg hover:shadow-purple-500/30 transition-all">
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
