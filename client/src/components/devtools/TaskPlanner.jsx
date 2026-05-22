"use client";
import React, { useState, useEffect } from "react";
import { Typography, Card, Input, Button, List, Checkbox, Tag, Space, message, Popconfirm } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;

const TaskPlanner = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("algovista_dev_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks");
      }
    }
  }, []);

  // Save to local storage whenever tasks change
  useEffect(() => {
    localStorage.setItem("algovista_dev_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([task, ...tasks]);
    setNewTask("");
    message.success("Task added");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    message.info("Task removed");
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
    message.success("Cleared completed tasks");
  };

  const activeTasks = tasks.filter(t => !t.completed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", padding: "40px", color: "white" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/devtools")}
        style={{ color: "#a1a1aa", marginBottom: 20 }}
      >
        Back to DevTools
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 800, margin: "0 auto" }}>
        <Title level={2} style={{ color: "white", fontWeight: 700, marginBottom: 8 }}>
          Dev Task Planner
        </Title>
        <Paragraph style={{ color: "#a1a1aa", fontSize: 16, marginBottom: 32 }}>
          Keep track of your algorithm implementations, bug fixes, and project ideas. (Saved locally in your browser).
        </Paragraph>

        <Card
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <Input
              size="large"
              placeholder="e.g. Implement Dijkstra's algorithm for shortest path..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onPressEnter={handleAddTask}
              style={{ background: "rgba(0,0,0,0.4)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAddTask}
              style={{ fontWeight: 600, borderRadius: 8 }}
            >
              Add Task
            </Button>
          </div>
        </Card>

        <Card
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "white", fontWeight: 600 }}>{activeTasks} tasks remaining</span>
            {tasks.length > activeTasks && (
              <Popconfirm
                title="Clear all completed tasks?"
                onConfirm={clearCompleted}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" size="small" style={{ color: "#f87171" }}>
                  Clear completed
                </Button>
              </Popconfirm>
            )}
          </div>

          <List
            dataSource={tasks}
            locale={{ emptyText: <span style={{ color: "#a1a1aa" }}>No tasks yet. You're all caught up!</span> }}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: item.completed ? "rgba(255,255,255,0.01)" : "transparent",
                  transition: "background 0.3s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, cursor: "pointer" }} onClick={() => toggleTask(item.id)}>
                  <Checkbox checked={item.completed} style={{ transform: "scale(1.2)" }} />
                  <span style={{ 
                    color: item.completed ? "#71717a" : "white", 
                    fontSize: 16,
                    textDecoration: item.completed ? "line-through" : "none",
                    transition: "all 0.2s"
                  }}>
                    {item.text}
                  </span>
                </div>
                <Space>
                  {item.completed && <Tag color="success" icon={<CheckCircleOutlined />}>Done</Tag>}
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }}
                    style={{ color: "#a1a1aa" }}
                    className="hover:!text-red-400"
                  />
                </Space>
              </List.Item>
            )}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default TaskPlanner;
