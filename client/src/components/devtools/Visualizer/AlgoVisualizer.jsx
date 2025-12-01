"use client";
import React from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { motion } from "framer-motion";
import {
  SortAscendingOutlined,
  NodeIndexOutlined,
  ApartmentOutlined,
  FunctionOutlined,
  BranchesOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const categories = [
  {
    name: "Sorting Visualizer",
    icon: <SortAscendingOutlined style={{ fontSize: 44, color: "#ffffff" }} />,
    desc: "Visualize sorting algorithms like Bubble, Merge, Quick and more.",
    route: "/devtools/visualizer/sorting",
  },
  {
    name: "Graph Visualizer",
    icon: <NodeIndexOutlined style={{ fontSize: 44, color: "#ffffff" }} />,
    desc: "Explore graph traversal algorithms like BFS, DFS, and Dijkstra.",
    route: "/devtools/visualizer/graph",
  },
  {
    name: "Tree Visualizer",
    icon: <ApartmentOutlined style={{ fontSize: 44, color: "#ffffff" }} />,
    desc: "See binary tree and BST traversal animations in action.",
    route: "/devtools/visualizer/tree",
  },
  {
    name: "Recursion Visualizer",
    icon: <FunctionOutlined style={{ fontSize: 44, color: "#ffffff" }} />,
    desc: "Understand recursive function calls with visual stack frames.",
    route: "/devtools/visualizer/recursion",
  },
  {
    name: "Dynamic Programming Visualizer",
    icon: <ReloadOutlined style={{ fontSize: 44, color: "#ffffff" }} />,
    desc: "Visualize DP problems like Fibonacci, Knapsack, and LIS.",
    route: "/devtools/visualizer/dynamic",
  },
  {
    name: "Backtracking Visualizer",
    icon: <BranchesOutlined style={{ fontSize: 44, color: "#ffffff" }} />,
    desc: "Solve N-Queens, Sudoku and maze problems visually.",
    route: "/devtools/visualizer/backtracking",
  },
];

const AlgoVisualizer = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'JetBrains Mono', monospace",
        background: "radial-gradient(circle at top, #111, #000)",
        color: "#fff",
        padding: "60px 80px",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: 50 }}
      >
        <Title
          level={2}
          style={{
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: 1,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          🧩 Algorithm Visualizer Hub
        </Title>

        <Paragraph
          style={{ color: "#aaa", fontSize: 16, fontFamily: "'JetBrains Mono', monospace" }}
        >
          Explore sorting, graphs, trees, recursion and more — interactively.
        </Paragraph>
      </motion.div>

      {/* Cards */}
      <Row gutter={[32, 32]} justify="center">
        {categories.map((cat, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <motion.div
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Card
                bordered={false}
                style={{
                  height: 260,
                  background: "rgba(15, 15, 20, 0.8)",
                  borderRadius: 18,
                  border: "1px solid #333",
                  boxShadow: "0 0 14px #ffffff22",
                  cursor: "pointer",
                  textAlign: "center",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                }}
                onClick={() => navigate(cat.route)}
              >
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                  style={{ marginBottom: 10 }}
                >
                  {cat.icon}
                </motion.div>

                <Title
                  level={4}
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    marginBottom: 6,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {cat.name}
                </Title>

                <Paragraph
                  style={{
                    color: "#999",
                    fontSize: 13,
                    lineHeight: 1.4,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {cat.desc}
                </Paragraph>

                <Button
                  type="default"
                  style={{
                    marginTop: 10,
                    border: "1px solid #fff",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onClick={() => navigate(cat.route)}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#fff";
                    e.target.style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#fff";
                  }}
                >
                  Open
                </Button>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AlgoVisualizer;
