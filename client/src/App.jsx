import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import axios from "axios";
import Context from "./util/context";
import Problems from "./components/Problems";
import Roadmaps from "./components/Roadmaps";
import AdminDashboard from "./components/admin/AdminDashboard";
import RoadmapDetail from "./components/RoadmapDetail";
import AddRoadmap from "./components/admin/AddRoadmap";
import Settings from "./components/Dashboard";
import AdminSettings from "./components/admin/AdminSettings";
import NotFound from "./components/NotFound";

import SuccessStory from "./components/SuccessStory";
import AdminManager from "./components/super-admin/AdminManager";
import AdminSuccessStories from "./components/admin/AdminSuccessStories";
import Mentorship from "./components/Mentorship";
import ProfileManger from "./components/ProfileManger";
import DevTools from "./components/DevTools";
import AlgoVisualizer from "./components/devtools/Visualizer/AlgoVisualizer";
import SortingVisualizer from "./components/devtools/Visualizer/SortingVisualizer";
import UserSidebar from "./components/UserSidebar";
import AddProblems from "./components/admin/AddProblems";
import CodeEditor from "./components/CodeEditor";
import AddCourse from "./components/admin/AddCourse";
import Course from "./components/Course";
import CourseDetails from "./components/CourseDeatils";
import CourseLearn from "./components/CourseLearn";

function App() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState(null);

  const getSession = async () => {
    try {
      setSessionLoading(true);
      const { data } = await axios.get("http://localhost:4000/auth/session", {
        withCredentials: true,
      });
      setSession(data);
    } catch (err) {
      setSession(null);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  return (
    <Context.Provider value={{ session, setSession, sessionLoading, setSessionLoading }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<Dashboard/>}
          />

          <Route path="/courses" element={<Course /> } />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/courses/:id/learn" element={<CourseLearn />} />
          <Route
            path="/problems"
            element={<Problems />}
          />
          <Route path="/problems/:id"  element={<CodeEditor />}/>
          <Route
            path="/roadmaps"
            element={<Roadmaps />}
          />

          <Route
            path="/roadmaps/:id"
            element={<RoadmapDetail />}
          />

          
          <Route 
           path="/admin/dashboard"
           element={<AdminDashboard/>}
          />

           <Route 
           path="/admin/settings"
           element={<AdminSettings/>}
          />

          <Route path="/admin/course" element={<AddCourse />}/>

          <Route path="*" element={<NotFound />} />


         <Route  path="/admin/roadmaps" element={<AddRoadmap />}/>

          <Route path="/admin/success-stories" element={<AdminSuccessStories/>}/>
          
          <Route  path="/success-stories" element={<SuccessStory />}/>

          <Route path="/admin/problems" element ={<AddProblems />} />


          {/* SUPER ADMIN */}

          <Route  path="/admin-manager" element={<AdminManager />}/>
          <Route  path="/devtools" element={<DevTools />}/>




          {/* // mentor */}

      <Route  path="/mentorship" element={<Mentorship />}/>
      <Route path="/profile/:id" element={<ProfileManger />} />


 <Route path="/sidebar" element={<UserSidebar />} />
{/* DEV TOOLS */}

<Route path="/devtools/visualizer"  element={<AlgoVisualizer/>}/>
<Route path="/devtools/visualizer/sorting" element={<SortingVisualizer/>}/>

        </Routes>
      </Router>
    </Context.Provider>
  );
}

export default App;
