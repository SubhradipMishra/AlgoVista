"use client";
import React, { useState } from "react";
import { Typography, Card, Input, Button, message, Spin, Empty } from "antd";
import { ArrowLeftOutlined, PictureOutlined, DownloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;
const { Search } = Input;

const PhotoGenerator = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = (value) => {
    if (!value.trim()) {
      message.warning("Please enter a descriptive prompt.");
      return;
    }
    setLoading(true);
    setPrompt(value);
    
    // Pollinations API generates a fresh image based on URL
    const seed = Math.floor(Math.random() * 100000);
    const newImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(value)}?width=1024&height=1024&nologo=true&seed=${seed}`;
    
    // Pre-load the image so it doesn't show broken while loading
    const img = new Image();
    img.onload = () => {
      setImageUrl(newImageUrl);
      setLoading(false);
      message.success("Image generated!");
    };
    img.onerror = () => {
      setLoading(false);
      message.error("Failed to generate image.");
    };
    img.src = newImageUrl;
  };

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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Title level={2} style={{ color: "white", fontWeight: 700, marginBottom: 8 }}>
          AI Photo Generator
        </Title>
        <Paragraph style={{ color: "#a1a1aa", fontSize: 16, marginBottom: 32 }}>
          Describe what you want to see, and AI will generate a unique image for you instantly.
        </Paragraph>

        <Card
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            marginBottom: 24,
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          <Search
            placeholder="e.g. A futuristic cyberpunk city at night with neon lights..."
            enterButton="Generate"
            size="large"
            onSearch={handleGenerate}
            loading={loading}
          />
        </Card>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "100px" }}>
              <Spin size="large" />
              <p style={{ marginTop: 20, color: "#a1a1aa" }}>Synthesizing image pixels...</p>
            </div>
          ) : imageUrl ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  maxWidth: 800,
                }}
              >
                <img src={imageUrl} alt={prompt} style={{ width: "100%", height: "auto", display: "block" }} />
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="large"
                  href={imageUrl}
                  download="generated-ai-image.jpg"
                  target="_blank"
                  style={{ position: "absolute", bottom: 20, right: 20, borderRadius: 8, fontWeight: "bold" }}
                >
                  Download Image
                </Button>
              </div>
            </motion.div>
          ) : (
            <div style={{ padding: "100px", opacity: 0.5 }}>
              <Empty
                image={<PictureOutlined style={{ fontSize: 64, color: "#555" }} />}
                description={<span style={{ color: "#a1a1aa" }}>Your masterpiece will appear here</span>}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PhotoGenerator;
