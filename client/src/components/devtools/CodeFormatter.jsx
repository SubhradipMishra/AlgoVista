"use client";
import React, { useRef, useState } from "react";
import { Typography, Card, Button, message, Space, Select } from "antd";
import { ArrowLeftOutlined, ThunderboltOutlined, CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const CodeFormatter = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Paste your messy code here...\n\nfunction hello(){\nconsole.log('world')\n}");

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleFormat = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.getAction('editor.action.formatDocument').run().then(() => {
        message.success("Code formatted successfully!");
      });
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.getValue());
      message.success("Formatted code copied to clipboard!");
    }
  };

  const handleClear = () => {
    setCode("");
    if (editorRef.current) {
      editorRef.current.setValue("");
    }
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <Title level={2} style={{ color: "white", fontWeight: 700, marginBottom: 8 }}>
              Code Formatter
            </Title>
            <Paragraph style={{ color: "#a1a1aa", fontSize: 16, margin: 0 }}>
              Instantly beautify your messy code. Supports multiple languages.
            </Paragraph>
          </div>

          <Space>
            <Select 
              value={language} 
              onChange={setLanguage} 
              style={{ width: 150 }}
              size="large"
            >
              <Option value="javascript">JavaScript</Option>
              <Option value="typescript">TypeScript</Option>
              <Option value="json">JSON</Option>
              <Option value="html">HTML</Option>
              <Option value="css">CSS</Option>
            </Select>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={handleClear}
              size="large"
              style={{ color: "#f87171" }}
            >
              Clear
            </Button>
            <Button
              type="default"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              size="large"
            >
              Copy
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleFormat}
              size="large"
              style={{ fontWeight: "bold" }}
            >
              Format Code
            </Button>
          </Space>
        </div>

        <Card
          style={{
            flex: 1,
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 0,
            overflow: "hidden"
          }}
          bodyStyle={{ padding: 0, height: "100%" }}
        >
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              wordWrap: "on",
              formatOnPaste: true,
            }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default CodeFormatter;
