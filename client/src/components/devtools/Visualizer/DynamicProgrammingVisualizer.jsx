"use client";
import React, { useState } from "react";
import { Typography, Card, Button, InputNumber, Space, message, Row, Col, Slider, Divider } from "antd";
import { PlayCircleOutlined, ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;

const DynamicProgrammingVisualizer = () => {
  const navigate = useNavigate();
  const [n, setN] = useState(10);
  const [dpArray, setDpArray] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Animation State
  const [speed, setSpeed] = useState(800); // ms delay
  const [activeLine, setActiveLine] = useState(null);
  
  // Highlighting: [current_i, previous_1, previous_2]
  const [highlights, setHighlights] = useState({ current: null, p1: null, p2: null });
  const [statusText, setStatusText] = useState("Enter N and click Run to visualize DP Tabulation.");

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runFibonacciDP = async () => {
    if (n < 2 || n > 20) {
      message.error("Please enter an N between 2 and 20 for visualization.");
      return;
    }
    
    setIsRunning(true);
    setHighlights({ current: null, p1: null, p2: null });
    
    // Initialize array with nulls
    setActiveLine(0);
    setStatusText(`Initializing DP Array of size ${n + 1}`);
    const dp = new Array(n + 1).fill(null);
    setDpArray([...dp]);
    await delay(speed);

    // Base cases
    setActiveLine(1);
    setStatusText("Setting base case: dp[0] = 0");
    dp[0] = 0;
    setDpArray([...dp]);
    setHighlights({ current: 0, p1: null, p2: null });
    await delay(speed);

    setActiveLine(2);
    setStatusText("Setting base case: dp[1] = 1");
    dp[1] = 1;
    setDpArray([...dp]);
    setHighlights({ current: 1, p1: null, p2: null });
    await delay(speed);

    // Tabulation
    for (let i = 2; i <= n; i++) {
      setActiveLine(3); // for loop
      await delay(speed / 2);
      
      setActiveLine(4);
      setStatusText(`Calculating dp[${i}] = dp[${i-1}] + dp[${i-2}]`);
      setHighlights({ current: i, p1: i - 1, p2: i - 2 });
      await delay(speed);

      dp[i] = dp[i - 1] + dp[i - 2];
      setDpArray([...dp]);
      await delay(speed / 2);
    }

    setActiveLine(5);
    setStatusText(`Finished! The ${n}th Fibonacci number is ${dp[n]}.`);
    setHighlights({ current: n, p1: null, p2: null });
    setIsRunning(false);
  };

  const reset = () => {
    setDpArray([]);
    setHighlights({ current: null, p1: null, p2: null });
    setStatusText("Enter N and click Run to visualize DP Tabulation.");
    setActiveLine(null);
    setIsRunning(false);
  };

  const CodeBlock = () => {
    const codeLines = [
      "const dp = new Array(n + 1);",                    // 0
      "dp[0] = 0;",                                      // 1
      "dp[1] = 1;",                                      // 2
      "for (let i = 2; i <= n; i++):",                   // 3
      "  dp[i] = dp[i - 1] + dp[i - 2];",                // 4
      "return dp[n];"                                    // 5
    ];

    return (
      <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden font-mono text-[13px] shadow-inner mb-6">
        {codeLines.map((line, idx) => (
          <div 
            key={idx} 
            className={`px-4 py-1.5 transition-colors duration-150 ${activeLine === idx ? 'bg-[var(--primary)]/20 text-[var(--primary)] border-l-2 border-[var(--primary)] font-bold' : 'text-green-400/70 border-l-2 border-transparent'}`}
          >
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070709] font-sans p-6 text-gray-200">
      <div className="max-w-[1400px] mx-auto">
        
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/devtools/visualizer")}
          className="text-gray-400 hover:text-white mb-6"
        >
          Back to Hub
        </Button>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dynamic Programming <span className="text-[var(--primary)]">Visualizer</span></h1>
            <p className="text-gray-400">Visualize bottom-up DP tabulation using the Fibonacci Sequence.</p>
          </div>
          
          <Space size="middle" className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-wrap">
            
            <div className="flex flex-col mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Grid Size (N)</span>
              <InputNumber 
                min={2} 
                max={20} 
                value={n}
                onChange={setN}
                disabled={isRunning}
              />
            </div>
            
            <div className="flex flex-col w-[120px] mx-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Delay</span>
              <Slider 
                min={100} max={1500} step={100} 
                value={speed} 
                onChange={setSpeed} 
                disabled={isRunning} 
                tooltip={{ formatter: val => `${val}ms` }}
                className="m-0"
              />
            </div>

            <Button type="default" onClick={reset} disabled={isRunning} icon={<ReloadOutlined />}>Reset</Button>

            <Button 
              type="primary" 
              onClick={runFibonacciDP} 
              disabled={isRunning}
              icon={<PlayCircleOutlined />}
              className="font-bold shadow-[0_0_15px_rgba(250,204,21,0.4)] h-10 px-6"
            >
              Run Bottom-Up DP
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Left Panel: DP Array */}
          <Col xs={24} xl={16}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl rounded-2xl min-h-[600px] h-full flex flex-col">
              <h3 className="text-lg font-bold text-white mb-8">DP State Array <code>dp[0...N]</code></h3>
              
              <div className="flex-1 flex flex-wrap gap-4 items-center justify-center p-4">
                {dpArray.length > 0 ? dpArray.map((val, idx) => {
                  
                  let cellClass = "bg-[#1e1e24] border-gray-600 text-gray-400"; // default
                  
                  if (highlights.current === idx) {
                    cellClass = "bg-[var(--primary)] text-black border-[var(--primary)] shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-110 z-10";
                  } else if (highlights.p1 === idx || highlights.p2 === idx) {
                    cellClass = "bg-green-500/20 text-green-400 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                  } else if (val !== null) {
                    cellClass = "bg-white/10 text-white border-white/30";
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: highlights.current === idx ? 1.1 : 1 }}
                        transition={{ duration: 0.3 }}
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold border-2 transition-all duration-300 ${cellClass}`}
                      >
                        {val !== null ? val : "?"}
                      </motion.div>
                      <div className="mt-2 text-xs text-gray-500 font-mono">
                        i={idx}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="w-full text-center text-gray-500 mt-20">
                    Click "Run" to allocate and fill the DP array.
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="mt-8 pt-4 border-t border-white/10 flex gap-6 justify-center text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[var(--primary)] rounded-sm"></div> Current `dp[i]`
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/40 rounded-sm border border-green-500"></div> Lookup `dp[i-1]` / `dp[i-2]`
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded-sm"></div> Solved
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Panel: Explanation & Code Stepper */}
          <Col xs={24} xl={8}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl rounded-2xl h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Execution Trace</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                  {isRunning ? 'Running' : 'Idle'}
                </div>
              </div>

              {/* Status Box */}
              <div className="mb-6 p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 shadow-inner">
                <span className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest block mb-1">Live Status</span>
                <span className="text-white font-medium">{statusText}</span>
              </div>

              <CodeBlock />

              <Divider className="border-white/10" />

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Algorithm Details</h4>
                <div className="space-y-4">
                  <div className="bg-white/[0.03] p-4 rounded-lg border border-white/5">
                    <div className="text-[var(--primary)] font-bold mb-1">Fibonacci (Tabulation)</div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      Tabulation is a Bottom-Up Dynamic Programming technique. It solves problems by first solving all related sub-problems, storing their results in a table (like an array), and then using those results to solve the original problem.
                    </p>
                    <div className="flex gap-4 text-xs font-mono">
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Time:</span> O(n)</div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Space:</span> O(n)</div>
                    </div>
                  </div>
                </div>
              </div>

            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default DynamicProgrammingVisualizer;
