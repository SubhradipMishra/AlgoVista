"use client";
import React, { useState } from "react";
import { Row, Col } from "antd";
import {
  BarChartOutlined,
  DatabaseOutlined,
  PictureOutlined,
  ScheduleOutlined,
  CodeOutlined,
  SettingOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const tools = [
  {
    name: "AlgoVisualizer",
    icon: <BarChartOutlined />,
    desc: "Visualize complex algorithms step by step in real-time.",
    route: "/devtools/visualizer",
    featured: true,
  },
  {
    name: "JSON Generator",
    icon: <DatabaseOutlined />,
    desc: "Mock realistic JSON data instantly for APIs.",
    route: "/devtools/json-generator",
  },
  {
    name: "AI Photo Gen",
    icon: <PictureOutlined />,
    desc: "Synthesize high-quality AI images from text prompts.",
    route: "/devtools/photo-generator",
  },
  {
    name: "Task Planner",
    icon: <ScheduleOutlined />,
    desc: "Organize, track, and plan your coding tasks.",
    route: "/devtools/task-planner",
  },
  {
    name: "Code Formatter",
    icon: <CodeOutlined />,
    desc: "Instantly format, clean, and beautify your code.",
    route: "/devtools/code-formatter",
  },
  {
    name: "Env Configurator",
    icon: <SettingOutlined />,
    desc: "Generate secure .env boilerplates for any stack.",
    route: "/devtools/configurator",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
};

const DevTools = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="min-h-screen bg-[#070709] font-sans relative overflow-hidden text-gray-200">
      
      {/* Developer Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)'
        }}
      />
      
      {/* Top Glow Glow */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[60%] h-[400px] rounded-[100%] bg-[var(--primary)] opacity-[0.06] blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:px-12 lg:px-16">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24 flex flex-col items-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[rgba(250,204,21,0.2)] bg-[rgba(250,204,21,0.05)] px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
              Developer Hub
            </span>
          </div>
          
          {/* Fix for the cut-off 'g' by using pb-4 and removing extreme clipping masks */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 pb-2">
            AlgoVista <span className="text-[var(--primary)]">DevTools</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            A premium collection of engineering utilities to automate tasks, generate data, and visualize structures with absolute precision.
          </p>
        </motion.div>

        {/* Grid Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row gutter={[24, 24]} justify="center">
            {tools.map((tool, index) => (
              <Col xs={24} sm={12} lg={tool.featured ? 16 : 8} xl={tool.featured ? 12 : 6} key={index}>
                <motion.div variants={itemVariants} className="h-full">
                  <div
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate(tool.route)}
                    className={`
                      group relative h-full flex flex-col justify-between p-8 rounded-2xl cursor-pointer transition-all duration-300
                      ${hovered === index 
                        ? 'bg-[#15151a] border-[rgba(250,204,21,0.4)] shadow-[0_10px_40px_-10px_rgba(250,204,21,0.25)] -translate-y-2' 
                        : 'bg-[#111115] border-white/[0.06] shadow-none'}
                      border
                    `}
                  >
                    
                    {/* Top Accent Line on Hover */}
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 transition-opacity duration-300 ${hovered === index ? 'opacity-100' : ''}`} />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-6 flex items-center justify-between">
                        <div className={`
                          h-14 w-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300
                          ${hovered === index 
                            ? 'bg-[var(--primary)] text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]' 
                            : 'bg-white/[0.03] border border-white/5 text-gray-400'}
                        `}>
                          {tool.icon}
                        </div>
                        
                        <div className={`
                          flex items-center justify-center h-8 w-8 rounded-full bg-white/[0.03] border border-white/5 transition-all duration-300
                          ${hovered === index ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]' : 'text-gray-600'}
                        `}>
                          <ArrowRightOutlined className={`transition-transform duration-300 ${hovered === index ? '-rotate-45' : 'rotate-0'}`} />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${hovered === index ? 'text-white' : 'text-gray-200'}`}>
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                          {tool.desc}
                        </p>
                      </div>
                      
                      {tool.featured && (
                        <div className="mt-6 pt-4 border-t border-white/[0.04]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                            ★ Primary Utility
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>
    </div>
  );
};

export default DevTools;
