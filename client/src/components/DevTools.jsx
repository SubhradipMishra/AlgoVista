"use client";
import React, { useState } from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import {
  BarChartOutlined,
  DatabaseOutlined,
  PictureOutlined,
  ScheduleOutlined,
  CodeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const tools = [
  {
    name: "AlgoVisualizer",
    icon: <BarChartOutlined style={{ fontSize: 42 }} />,
    desc: "Visualize algorithms step by step.",
    route: "/devtools/visualizer",
  },
  {
    name: "JSON Dummy Data Generator",
    icon: <DatabaseOutlined style={{ fontSize: 42 }} />,
    desc: "Generate fake JSON data for APIs.",
    route: "/devtools/json-generator",
  },
  {
    name: "AI Photo Generator",
    icon: <PictureOutlined style={{ fontSize: 42 }} />,
    desc: "Generate AI-powered images.",
    route: "/devtools/photo-generator",
  },
  {
    name: "Task Planner",
    icon: <ScheduleOutlined style={{ fontSize: 42 }} />,
    desc: "Plan and track your algorithm tasks.",
    route: "/devtools/task-planner",
  },
  {
    name: "Code Formatter",
    icon: <CodeOutlined style={{ fontSize: 42 }} />,
    desc: "Format and beautify your code instantly.",
    route: "/devtools/code-formatter",
  },
  {
    name: "Env Configurator",
    icon: <SettingOutlined style={{ fontSize: 42 }} />,
    desc: "Manage .env and project configurations.",
    route: "/devtools/configurator",
  },
];

const DevTools = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "60px 80px",
        fontFamily: "monospace",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: 60 }}
      >
        <Title
          level={2}
          style={{
            color: "white",
            fontWeight: 900,
            letterSpacing: 1,
            fontFamily: "monospace",
            textShadow: "0 0 12px rgba(255,255,255,0.4)",
          }}
        >
          🧰 AlgoVista DevTools
        </Title>

        <Paragraph
          style={{
            color: "#a1a1a1",
            fontSize: 16,
            fontFamily: "monospace",
          }}
        >
          Modern tools for algorithms, automation, and creativity.
        </Paragraph>
      </motion.div>

      {/* Grid */}
      <Row gutter={[32, 32]} justify="center">
        {tools.map((tool, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <motion.div
              whileHover={{ y: -8, scale: 1.05 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Card
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                bordered={false}
                style={{
                  height: 280,
                  background: "rgba(15,15,15,0.8)",
                  border:
                    hovered === index
                      ? "1px solid white"
                      : "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "24px",
                  cursor: "pointer",
                  boxShadow:
                    hovered === index
                      ? "0 0 25px rgba(255,255,255,0.4)"
                      : "0 0 10px rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                  fontFamily: "monospace",
                }}
                onClick={() => navigate(tool.route)}
              >
                {/* Icon */}
                <motion.div
                  animate={{
                    rotate: hovered === index ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    marginBottom: 10,
                    color: hovered === index ? "white" : "#e5e5e5",
                  }}
                >
                  {tool.icon}
                </motion.div>

                {/* Title + Desc */}
                <div style={{ textAlign: "center" }}>
                  <Title
                    level={4}
                    style={{
                      color: "white",
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      marginBottom: 6,
                      fontFamily: "monospace",
                    }}
                  >
                    {tool.name}
                  </Title>

                  <Paragraph
                    style={{
                      color: "#b3b3b3",
                      fontSize: 13,
                      lineHeight: 1.4,
                      marginBottom: 10,
                      fontFamily: "monospace",
                    }}
                  >
                    {tool.desc}
                  </Paragraph>
                </div>

                {/* Button */}
                <Button
                  type="primary"
                  style={{
                    background: hovered === index ? "white" : "#e5e5e5",
                    border: "none",
                    color: "black",
                    width: "85%",
                    fontWeight: 600,
                    fontFamily: "monospace",
                    borderRadius: 10,
                    boxShadow:
                      hovered === index
                        ? "0 0 18px rgba(255,255,255,0.5)"
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => navigate(tool.route)}
                >
                  Launch
                </Button>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DevTools;
