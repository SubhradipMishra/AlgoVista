"use client";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Drawer, Menu, Avatar, Button } from "antd";
import { motion } from "framer-motion";

import {
  DashboardOutlined,
  BranchesOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
} from "@ant-design/icons";

const AdminSidebar = ({ session, open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/admin/roadmaps", icon: <BranchesOutlined />, label: "Roadmaps" },
    { key: "/admin/problems", icon: <QuestionCircleOutlined />, label: "Problems" },
    { key: "/admin/course", icon: <BookOutlined />, label: "Courses" },
    { key: "/admin/settings", icon: <SettingOutlined />, label: "Settings" },
    { key: "/logout", icon: <LogoutOutlined />, label: "Logout" },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col h-screen 
        bg-black text-white border-r border-[#222]
        transition-all duration-300
        ${collapsed ? "w-20" : "w-72"} font-mono`}
      >
        {/* Toggle */}
        <div className="flex justify-end p-3 border-b border-[#222]">
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            className="!text-gray-300 hover:!text-white transition"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 20 }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 20 }} />
              )
            }
          />
        </div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`flex flex-col items-center gap-3 py-8 border-b border-[#222]
          ${collapsed ? "px-1" : "px-4"}`}
        >
          <Avatar
            size={collapsed ? 45 : 75}
            src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
          />

          {!collapsed && (
            <>
              <h2 className="text-lg font-semibold">{session.fullname || "Admin User"}</h2>
              <h4 className="text-xs opacity-70">{session.email}</h4>
              <p className="text-[10px] opacity-50 uppercase tracking-wide">
                {session.role || "Admin"}
              </p>
            </>
          )}
        </motion.div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="font-mono bg-black menu-bw"
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        width={260}
        bodyStyle={{ padding: 0, background: "black" }}
        headerStyle={{ background: "#000", borderBottom: "1px solid #222" }}
        title={
          <div className="flex flex-col items-center font-mono text-white">
            <Avatar size={64} src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" />
            <h3 className="font-bold mt-2 text-lg">{session?.fullname}</h3>
            <p className="text-xs opacity-60 uppercase">{session?.role}</p>
          </div>
        }
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="font-mono bg-black menu-bw"
        />
      </Drawer>

      {/* PURE BLACK & WHITE MENU STYLING */}
      <style>{`
        .menu-bw .ant-menu-item {
          margin: 6px 0 !important;
          height: 46px !important;
          border-radius: 6px !important;
          padding-left: 14px !important;
          color: #ccc !important;
        }

        .menu-bw .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: white !important;
        }

        .menu-bw .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.16) !important;
          color: white !important;
          border-left: 3px solid white !important;
        }

        .menu-bw .ant-menu-item-selected .ant-menu-title-content {
          font-weight: 600 !important;
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
