"use client";
import React, { useState } from "react";
import { Layout, Typography, Card, Form, Select, InputNumber, Button, message, Space } from "antd";
import Editor from "@monaco-editor/react";
import { ArrowLeftOutlined, CopyOutlined, SyncOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Content } = Layout;

const generateData = (schema, count) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    if (schema === "users") {
      data.push({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? "admin" : "user",
        isActive: Math.random() > 0.2,
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      });
    } else if (schema === "products") {
      data.push({
        id: i + 1,
        productName: `Product ${i + 1}`,
        price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
        category: ["Electronics", "Clothing", "Books", "Home"][Math.floor(Math.random() * 4)],
        inStock: Math.random() > 0.1,
      });
    } else if (schema === "posts") {
      data.push({
        id: i + 1,
        title: `Blog Post ${i + 1}`,
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        authorId: Math.floor(Math.random() * 10) + 1,
        tags: ["tech", "coding", "web"][Math.floor(Math.random() * 3)],
      });
    }
  }
  return data;
};

const JsonGenerator = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [jsonOutput, setJsonOutput] = useState("[\n  // Generated JSON will appear here\n]");
  const [loading, setLoading] = useState(false);

  const handleGenerate = (values) => {
    setLoading(true);
    setTimeout(() => {
      const { schema, count } = values;
      const data = generateData(schema, count);
      setJsonOutput(JSON.stringify(data, null, 2));
      setLoading(false);
      message.success(`Generated ${count} records for ${schema}!`);
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput);
    message.success("JSON copied to clipboard!");
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
          JSON Dummy Data Generator
        </Title>
        <Paragraph style={{ color: "#a1a1aa", fontSize: 16, marginBottom: 32 }}>
          Generate realistic mock JSON data instantly for testing and prototyping.
        </Paragraph>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {/* Controls Panel */}
          <Card
            style={{
              flex: "1 1 300px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{ schema: "users", count: 5 }}
            >
              <Form.Item label={<span style={{ color: "white" }}>Schema Type</span>} name="schema">
                <Select size="large">
                  <Option value="users">Users</Option>
                  <Option value="products">Products</Option>
                  <Option value="posts">Blog Posts</Option>
                </Select>
              </Form.Item>

              <Form.Item label={<span style={{ color: "white" }}>Number of Records (1-100)</span>} name="count">
                <InputNumber min={1} max={100} size="large" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item style={{ marginTop: 32 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SyncOutlined />}
                  loading={loading}
                  size="large"
                  block
                  style={{ fontWeight: 600 }}
                >
                  Generate JSON
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Output Panel */}
          <Card
            style={{
              flex: "2 1 500px",
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: 0,
              overflow: "hidden",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#a1a1aa", fontSize: 13, fontWeight: 600 }}>output.json</span>
              <Button type="text" icon={<CopyOutlined />} size="small" style={{ color: "#a1a1aa" }} onClick={handleCopy}>
                Copy
              </Button>
            </div>
            <div style={{ height: "450px" }}>
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={jsonOutput}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default JsonGenerator;
