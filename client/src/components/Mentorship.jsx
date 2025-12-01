"use client";
import React, { useEffect, useState, useContext } from "react";
import {
  DashboardOutlined,
  BranchesOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TrophyOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Drawer, Menu, Avatar, message, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Context from "../util/context";

const Mentorship = () => {
  const [open, setOpen] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { session, sessionLoading } = useContext(Context);
  const navigate = useNavigate();

  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Dashboard", route: "/admin/dashboard" },
    { key: "2", icon: <BranchesOutlined />, label: "Roadmaps", route: "/admin/roadmaps" },
    { key: "3", icon: <QuestionCircleOutlined />, label: "Questions", route: "/admin/questions" },
    { key: "4", icon: <SettingOutlined />, label: "Settings", route: "/admin/settings" },
    { key: "5", icon: <TrophyOutlined />, label: "Success Stories", route: "/admin/success-stories" },
    { key: "6", icon: <UserOutlined />, label: "Mentorship", route: "/admin/mentorship" },
    { key: "7", icon: <LogoutOutlined />, label: "Logout", route: "/logout" },
  ];

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (!item) return;
    if (item.key === "7") {
      message.success("Logged out!");
      navigate("/login");
    } else {
      navigate(item.route);
      setOpen(false);
    }
  };

  useEffect(() => { fetchMentors(); }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:4000/auth/mentors", {
        withCredentials: true,
      });
      setMentors(data.mentors || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch mentors");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white font-mono">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white font-mono">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-[#111111] border-r border-gray-700 p-6">
        <div className="flex flex-col items-center gap-3 border-b border-gray-700 pb-6 mb-6">
          <Avatar size={70} src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">{session?.fullname || "Admin"}</h2>
            <p className="text-sm text-gray-400">{session?.email}</p>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["6"]}
          items={menuItems}
          className="bg-transparent text-gray-300 font-mono"
          onClick={handleMenuClick}
        />
      </div>

      {/* Drawer for Mobile */}
      <Drawer
        title={
          <div className="flex flex-col items-center gap-2">
            <Avatar size={64} src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">{session?.fullname || "Admin"}</h3>
              <p className="text-gray-400 text-sm">{session?.email}</p>
            </div>
          </div>
        }
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["6"]}
          items={menuItems}
          className="font-mono"
          onClick={handleMenuClick}
        />
      </Drawer>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white font-mono">Mentorship</h1>
          <Button
            icon={<MenuOutlined />}
            className="md:hidden bg-gray-900 text-white font-mono"
            onClick={() => setOpen(true)}
          />
        </div>

        {/* Mentor Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.length > 0 ? (
            mentors.map((mentor) => (
              <div
                key={mentor._id}
                className="bg-[#121212] rounded-2xl border border-gray-700 p-6 shadow-lg hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    size={80}
                    src={mentor.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    className="mb-4 border-2 border-white"
                  />
                  <h2 className="text-xl font-semibold text-white">{mentor.fullname}</h2>
                  <p className="text-gray-400 text-sm">{mentor.email}</p>
                  <p className="text-white text-sm mt-2">{mentor.specialization || "General Mentor"}</p>
                  <p className="text-gray-400 mt-3 text-sm line-clamp-3">
                    {mentor.bio || "Passionate mentor helping students excel in their career paths."}
                  </p>

                  <div className="flex gap-3 mt-5">
                    <Button
                      type="primary"
                      className="bg-white text-black border-none hover:bg-gray-200"
                      onClick={() => navigate(`/mentor/${mentor._id}`)}
                    >
                      View Profile
                    </Button>
                    <Button className="bg-transparent border border-white text-white hover:bg-white hover:text-black">
                      Take Mentorship
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center col-span-full">No mentors available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mentorship;
