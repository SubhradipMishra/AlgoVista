"use client";
import React, { useState } from "react";
import { Layout, Menu, Avatar, Tag, Divider, Button } from "antd";
import {
  DashboardOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  FireOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

// Social Icon Component
const SocialIcon = ({ icon, url }) => (
  <a
    href={url || "#"}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-flex",
      alignItems: "center",
      color: "#f1f5f9",
      fontSize: 18,
      transition: "color 0.2s",
      margin: "0 4px",
      fontFamily: "monospace",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#ccc")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "#f1f5f9")}
  >
    {icon}
  </a>
);

const menuItems = [
  { key: "1", icon: <DashboardOutlined />, label: "Dashboard", link: "/dashboard/" },
  { key: "2", icon: <TrophyOutlined />, label: "Roadmaps", link: "/roadmaps" },
  { key: "3", icon: <SettingOutlined />, label: "Settings", link: "/dashboard/settings" },
  { key: "4", icon: <LogoutOutlined />, label: "Logout", link: "/logout" },
];

const UserSidebar = ({ user, selectedKey, setSelectedKey, navigate }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const onMenuClick = (e) => {
    setSelectedKey(e.key);
    const item = menuItems.find((i) => i.key === e.key);
    if (item?.link) navigate(item.link);
  };

  return (
    <Sider
      width={collapsed ? 70 : 260}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        backgroundColor: "#000",
        borderRight: "1px solid #111",
        paddingTop: 20,
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        color: "#f1f5f9",
      }}
    >
      {/* Collapse/Expand Button */}
      <div style={{ padding: "0 16px", marginBottom: 20, textAlign: collapsed ? "center" : "right" }}>
        <Button
          type="text"
          onClick={() => setCollapsed(!collapsed)}
          icon={collapsed ? <MenuUnfoldOutlined style={{ color: "#f1f5f9" }} /> : <MenuFoldOutlined style={{ color: "#f1f5f9" }} />}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        />
      </div>

      {/* Profile Section */}
      <div
        style={{
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          padding: collapsed ? 12 : "0 16px",
          gap: 12,
          whiteSpace: "nowrap",
          borderBottom: "1px solid #111",
          marginBottom: 16,
        }}
      >
        <Avatar size={collapsed ? 48 : 72} src={user.profileImage} icon={<UserOutlined />} />
        {!collapsed && (
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "600", fontSize: 18, overflow: "hidden", textOverflow: "ellipsis" }} title={user.fullname}>
              {user.fullname}
            </div>
            <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag style={{ fontWeight: 600, fontSize: 12, backgroundColor: "#111", color: "#f1f5f9" }}>{user.rank}</Tag>
              <Tag style={{ fontWeight: 600, fontSize: 12, backgroundColor: "#111", color: "#f1f5f9" }}>XP {user.xp}</Tag>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: "#f1f5f9" }}>
              <FireOutlined />
              <span>{user.streak}-day streak</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Button */}
      {!collapsed && (
        <div style={{ padding: "0 16px", marginBottom: 20 }}>
          <Button
            type="primary"
            block
            style={{ backgroundColor: "#111", borderColor: "#111", fontWeight: "bold", color: "#f1f5f9", fontFamily: "monospace" }}
            onClick={() => user._id && navigate(`/profile/${user._id}`)}
          >
            Edit Profile
          </Button>
        </div>
      )}

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={onMenuClick}
        items={menuItems.map(({ key, icon, label }) => ({ key, icon, label: collapsed ? null : label }))}
        style={{ flex: 1, borderRight: "none", fontWeight: 600, fontSize: 14, color: "#f1f5f9", fontFamily: "monospace" }}
      />

      {/* Social & Skills */}
      {!collapsed && (
        <>
          <Divider style={{ margin: "12px 0", borderColor: "#111" }} />
          <div style={{ padding: "0 16px", display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            {user.socialLinks?.github && <SocialIcon icon={<GithubOutlined />} url={user.socialLinks.github} />}
            {user.socialLinks?.linkedin && <SocialIcon icon={<LinkedinOutlined />} url={user.socialLinks.linkedin} />}
            {user.socialLinks?.twitter && <SocialIcon icon={<TwitterOutlined />} url={user.socialLinks.twitter} />}
            {user.socialLinks?.youtube && <SocialIcon icon={<YoutubeOutlined />} url={user.socialLinks.youtube} />}
          </div>
          <div style={{ padding: "0 16px 24px", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {user.skills?.length > 0 ? (
              user.skills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: "#111",
                    color: "#f1f5f9",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: 9999,
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    fontFamily: "monospace",
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ fontStyle: "italic", color: "#666", fontSize: 12, fontFamily: "monospace" }}>No skills added</span>
            )}
          </div>
          <Divider style={{ marginTop: 0, borderColor: "#111" }} />
          <p style={{ color: "#666", fontStyle: "italic", fontSize: 11, textAlign: "center", marginTop: 8, marginBottom: 16, fontFamily: "monospace" }}>
            “Learn fearlessly, create endlessly.”
          </p>
        </>
      )}
    </Sider>
  );
};

export default UserSidebar;
