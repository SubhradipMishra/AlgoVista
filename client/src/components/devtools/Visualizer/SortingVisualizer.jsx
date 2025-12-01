"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Slider,
  Typography,
  Card,
  Space,
  Progress,
  Select,
  Input,
  message,
  Divider,
} from "antd";
import { PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import Context from "../../../util/context";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const SortingVisualizer = () => {
  const { session } = useContext(Context);
  const location = useLocation();
  const currentRoute = location.pathname;

  const [array, setArray] = useState([]);
  const [speed, setSpeed] = useState(150);
  const [size, setSize] = useState(20);
  const [isSorting, setIsSorting] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [highlight, setHighlight] = useState([]);
  const [stats, setStats] = useState({ swaps: 0, comparisons: 0, time: 0 });
  const [liveStats, setLiveStats] = useState({ swaps: 0, comparisons: 0 });
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [pseudocodeLine, setPseudocodeLine] = useState(null);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [showFinalStats, setShowFinalStats] = useState(false);
  const [inputMode, setInputMode] = useState("random");
  const [customInput, setCustomInput] = useState("");
  const [theme, setTheme] = useState("dark"); // default dark theme

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Generate Array
  const generateArray = () => {
    let newArray = [];
    if (inputMode === "custom") {
      const nums = customInput
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((x) => !isNaN(x));
      if (nums.length === 0) {
        message.error("Invalid input! Enter comma-separated numbers like: 5,2,9,1");
        return;
      }
      newArray = nums;
      setSize(nums.length);
    } else {
      newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 20);
    }
    setArray(newArray);
    setHighlight([]);
    setSteps([]);
    setStats({ swaps: 0, comparisons: 0, time: 0 });
    setLiveStats({ swaps: 0, comparisons: 0 });
    setCurrentStep(0);
    setPseudocodeLine(null);
    setShowFinalStats(false);
    setIsGenerated(true);
  };

  useEffect(() => {
    generateArray();
  }, []);

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  // Sorting Algorithms
  const bubbleSort = () => {
    let arr = [...array], swaps = 0, comparisons = 0;
    const tempSteps = [];
    const start = performance.now();
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        comparisons++;
        tempSteps.push({ highlight: [j, j + 1], line: 2, message: `Compare ${arr[j]} and ${arr[j + 1]}`, arr: [...arr] });
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          tempSteps.push({ highlight: [j, j + 1], line: 3, message: `Swap ${arr[j]} and ${arr[j + 1]}`, arr: [...arr] });
        }
      }
    }
    const end = performance.now();
    return { steps: tempSteps, stats: { swaps, comparisons, time: ((end - start) / 1000).toFixed(2) } };
  };

  const selectionSort = () => {
    let arr = [...array], swaps = 0, comparisons = 0;
    const tempSteps = [];
    const start = performance.now();
    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < arr.length; j++) {
        comparisons++;
        tempSteps.push({ highlight: [minIdx, j], line: 2, message: `Compare ${arr[minIdx]} and ${arr[j]}`, arr: [...arr] });
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swaps++;
        tempSteps.push({ highlight: [i, minIdx], line: 4, message: `Swap ${arr[i]} and ${arr[minIdx]}`, arr: [...arr] });
      }
    }
    const end = performance.now();
    return { steps: tempSteps, stats: { swaps, comparisons, time: ((end - start) / 1000).toFixed(2) } };
  };

  const insertionSort = () => {
    let arr = [...array], swaps = 0, comparisons = 0;
    const tempSteps = [];
    const start = performance.now();
    for (let i = 1; i < arr.length; i++) {
      let key = arr[i], j = i - 1;
      while (j >= 0 && arr[j] > key) {
        comparisons++;
        arr[j + 1] = arr[j];
        tempSteps.push({ highlight: [j, j + 1], line: 2, message: `Move ${arr[j]} to position ${j + 1}`, arr: [...arr] });
        j--;
      }
      arr[j + 1] = key;
      swaps++;
      tempSteps.push({ highlight: [j + 1], line: 3, message: `Insert key ${key} at index ${j + 1}`, arr: [...arr] });
    }
    const end = performance.now();
    return { steps: tempSteps, stats: { swaps, comparisons, time: ((end - start) / 1000).toFixed(2) } };
  };

  const playSteps = async (allSteps) => {
    let swaps = 0, comparisons = 0;
    const start = performance.now();
    for (let i = 0; i < allSteps.length; i++) {
      const step = allSteps[i];
      setArray(step.arr);
      setHighlight(step.highlight);
      setPseudocodeLine(step.line);
      setCurrentStep(i + 1);

      if (step.message.toLowerCase().includes("compare")) comparisons++;
      if (step.message.toLowerCase().includes("swap") || step.message.toLowerCase().includes("insert")) swaps++;
      setLiveStats({ swaps, comparisons });
      await delay(speed);
    }
    const end = performance.now();
    setStats({ swaps, comparisons, time: ((end - start) / 1000).toFixed(2) });
    setHighlight([]);
    setPseudocodeLine(null);
  };

  const logActivity = async () => {
    try {
      await fetch("http://localhost:4000/activity", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.id,
          route: currentRoute,
          type: "sorting_visualizer",
          data: { algorithm, name: `${algorithm} Sort Visualizer` },
        }),
      });
    } catch (err) {
      console.error("Activity log failed:", err);
    }
  };

  const handleStart = async () => {
    if (isSorting || !isGenerated || array.length === 0) return;
    logActivity();
    setIsSorting(true);
    setShowFinalStats(false);
    setLiveStats({ swaps: 0, comparisons: 0 });

    let result;
    if (algorithm === "bubble") result = bubbleSort();
    else if (algorithm === "selection") result = selectionSort();
    else result = insertionSort();

    setSteps(result.steps);
    await delay(100);
    await playSteps(result.steps);

    setShowFinalStats(true);
    setIsSorting(false);
    setIsGenerated(false);
  };

  const pseudocodeMap = {
    bubble: ["for i in range(0, n):", "for j in range(0, n-i-1):", "if arr[j] > arr[j+1]:", "swap(arr[j], arr[j+1])"],
    selection: ["for i in range(0, n-1):", "min_idx = i", "for j in range(i+1, n):", "if arr[j] < arr[min_idx]: min_idx = j", "swap(arr[i], arr[min_idx])"],
    insertion: ["for i in range(1, n):", "key = arr[i]", "while j >= 0 and arr[j] > key:", "arr[j+1] = arr[j]; j -= 1", "arr[j+1] = key"],
  };

  const isDark = theme === "dark";

  return (
    <div style={{ minHeight: "100vh", color: isDark ? "#f1f5f9" : "#1e293b", background: isDark ? "#0f1118" : "#f8fafc", fontFamily: "monospace", padding: "60px 40px" }}>
      <div style={{ textAlign: "right", marginBottom: 20 }}>
        <Button onClick={toggleTheme}>{isDark ? "Switch to Light" : "Switch to Dark"}</Button>
      </div>

      <Title style={{ textAlign: "center", background: "linear-gradient(90deg,#3b82f6,#a855f7,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, marginBottom: 40 }}>
        Sorting Visualizer
      </Title>

      {/* Controls */}
      <Card style={{ background: isDark ? "#111118" : "#fff", borderRadius: 16, padding: 20, marginBottom: 40, color: isDark ? "#f1f5f9" : "#1e293b" }}>
        <Space align="center" size="large" wrap>
          <Select value={algorithm} onChange={setAlgorithm} style={{ width: 180 }} disabled={isSorting}>
            <Option value="bubble">Bubble Sort</Option>
            <Option value="selection">Selection Sort</Option>
            <Option value="insertion">Insertion Sort</Option>
          </Select>

          <Select value={inputMode} onChange={setInputMode} style={{ width: 180 }} disabled={isSorting}>
            <Option value="random">Random Array</Option>
            <Option value="custom">Custom Input</Option>
          </Select>

          {inputMode === "custom" && (
            <Input placeholder="Enter numbers e.g. 5,2,8,1" value={customInput} onChange={(e) => setCustomInput(e.target.value)} disabled={isSorting} style={{ width: 280 }} />
          )}

          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStart} disabled={!isGenerated || isSorting} style={{ background: "#3b82f6", border: "none", fontWeight: 600 }}>
            {isSorting ? "Sorting..." : "Start"}
          </Button>

          <Button icon={<ReloadOutlined />} onClick={generateArray} disabled={isSorting} style={{ background: "#16a34a", color: "#fff", border: "none", fontWeight: 600 }}>
            Generate
          </Button>

          {inputMode === "random" && (
            <>
              <div style={{ width: 200 }}>
                <Text>Speed</Text>
                <Slider min={50} max={400} value={speed} onChange={setSpeed} disabled={isSorting} />
              </div>
              <div style={{ width: 200 }}>
                <Text>Array Size</Text>
                <Slider min={5} max={40} value={size} onChange={setSize} disabled={isSorting} />
              </div>
            </>
          )}
        </Space>
      </Card>

      {/* Visualization */}
      <div style={{ background: isDark ? "#111118" : "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", height: 400, gap: 10, overflowX: "auto" }}>
          {array.map((value, i) => {
            const active = highlight.includes(i);
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, marginBottom: 4, color: isDark ? "#94a3b8" : "#475569" }}>{value}</div>
                <div style={{ width: Math.max(600 / array.length, 12), height: value * 3, background: active ? "#f59e0b" : "#60a5fa", borderRadius: 8, boxShadow: active ? "0 0 20px #fbbf24" : "0 0 15px #6366f1", transition: "height 0.2s ease" }} />
              </div>
            );
          })}
        </div>

        {showFinalStats && (
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 18, color: "#16a34a", fontWeight: 600 }}>
            ✅ Sorting Complete! <br />
            Swaps: {stats.swaps} | Comparisons: {stats.comparisons} | Time: {stats.time}s
          </div>
        )}
      </div>

      {/* Info Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        <Card title="Algorithm Steps" style={{ borderRadius: 16, background: isDark ? "#111118" : "#fff", color: isDark ? "#f1f5f9" : "#1e293b" }}>
          <Paragraph>{steps[currentStep - 1] ? steps[currentStep - 1].message : "Press Start to visualize steps."}</Paragraph>
          <Progress percent={((currentStep / steps.length) * 100).toFixed(0)} showInfo={false} strokeColor="#6366f1" />
        </Card>

        <Card title="Pseudocode" style={{ borderRadius: 16, background: isDark ? "#111118" : "#fff", color: isDark ? "#f1f5f9" : "#1e293b" }}>
          <pre style={{ fontFamily: "monospace", lineHeight: "1.8em", fontSize: 15 }}>
            {pseudocodeMap[algorithm].map((line, i) => (
              <div key={i} style={{ background: pseudocodeLine === i + 1 ? "rgba(147,197,253,0.4)" : "transparent", borderRadius: 6, padding: "2px 6px" }}>
                {line}
              </div>
            ))}
          </pre>
        </Card>

        <Card title="Time Complexity" style={{ borderRadius: 16, textAlign: "center", background: isDark ? "#111118" : "#fff", color: isDark ? "#f1f5f9" : "#1e293b" }}>
          {algorithm === "bubble" && (<Paragraph><Text strong>Best:</Text> O(n) <br /><Text strong>Average:</Text> O(n²) <br /><Text strong>Worst:</Text> O(n²)</Paragraph>)}
          {algorithm === "selection" && (<Paragraph><Text strong>Best:</Text> O(n²) <br /><Text strong>Average:</Text> O(n²) <br /><Text strong>Worst:</Text> O(n²)</Paragraph>)}
          {algorithm === "insertion" && (<Paragraph><Text strong>Best:</Text> O(n) <br /><Text strong>Average:</Text> O(n²) <br /><Text strong>Worst:</Text> O(n²)</Paragraph>)}
          <Divider />
          <Paragraph>
            <Text strong>Swaps:</Text> {liveStats.swaps || stats.swaps} <br />
            <Text strong>Comparisons:</Text> {liveStats.comparisons || stats.comparisons} <br />
            <Text strong>Time:</Text> {showFinalStats ? `${stats.time}s` : isSorting ? "Running..." : "--"}
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};

export default SortingVisualizer;
