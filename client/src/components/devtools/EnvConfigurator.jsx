"use client";
import React, { useState } from "react";
import { Typography, Card, Button, Select, Space, message, Input } from "antd";
import { ArrowLeftOutlined, CopyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const templates = {
  mern: `# MERN Stack Environment Variables
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173
`,
  nextjs: `# Next.js Environment Variables
# Public variables must start with NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Database
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
`,
  firebase: `# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=1:your_app_id:web:your_web_id

# Firebase Admin (Node.js backend)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
`,
  supabase: `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role (Backend only!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`,
};

const EnvConfigurator = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState("mern");
  const [envContent, setEnvContent] = useState(templates.mern);

  const handleTemplateChange = (value) => {
    setTemplate(value);
    setEnvContent(templates[value]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(envContent);
    message.success(".env config copied to clipboard!");
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 900, margin: "0 auto" }}>
        <Title level={2} style={{ color: "white", fontWeight: 700, marginBottom: 8 }}>
          Env Configurator
        </Title>
        <Paragraph style={{ color: "#a1a1aa", fontSize: 16, marginBottom: 32 }}>
          Generate standard boilerplate `.env` files for different stacks instantly.
        </Paragraph>

        <Card
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Space align="center">
              <span style={{ color: "white", fontWeight: 600 }}>Select Stack Template:</span>
              <Select 
                value={template} 
                onChange={handleTemplateChange}
                style={{ width: 200 }}
                size="large"
              >
                <Option value="mern">MERN Stack</Option>
                <Option value="nextjs">Next.js</Option>
                <Option value="supabase">Supabase</Option>
                <Option value="firebase">Firebase</Option>
              </Select>
            </Space>

            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              size="large"
              style={{ fontWeight: "bold" }}
            >
              Copy .env
            </Button>
          </div>

          <div style={{ position: "relative" }}>
            <TextArea
              value={envContent}
              onChange={(e) => setEnvContent(e.target.value)}
              autoSize={{ minRows: 15, maxRows: 25 }}
              style={{
                background: "rgba(0,0,0,0.6)",
                color: "#e2e8f0",
                fontFamily: "monospace",
                fontSize: 14,
                padding: 16,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                resize: "vertical"
              }}
              spellCheck={false}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EnvConfigurator;
