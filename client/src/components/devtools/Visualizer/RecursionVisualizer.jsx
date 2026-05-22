"use client";
import React, { useState } from "react";
import { Typography, Card, Button, InputNumber, Space, message, Row, Col, Slider, Divider } from "antd";
import { PlayCircleOutlined, ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Paragraph } = Typography;

const RecursionVisualizer = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(5);
  const [stack, setStack] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  
  // Animation State
  const [speed, setSpeed] = useState(800); // ms delay
  const [activeLine, setActiveLine] = useState(null);
  const [statusText, setStatusText] = useState("Enter N and click Run to visualize Call Stack.");

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const visualizeFactorial = async () => {
    if (inputValue < 0 || inputValue > 10) {
      message.error("Please enter a number between 0 and 10");
      return;
    }
    
    setIsRunning(true);
    setStack([]);
    setResult(null);
    setStatusText(`Starting factorial(${inputValue})`);

    // Call stack visualization logic
    const tempStack = [];
    
    // PUSH Phase (Winding)
    for (let i = inputValue; i >= 1; i--) {
      setActiveLine(0);
      setStatusText(`Calling factorial(${i})`);
      tempStack.push({
        id: `call-${i}`,
        fn: `factorial(${i})`,
        status: "waiting",
        val: i,
        result: null
      });
      setStack([...tempStack]);
      await delay(speed);
      
      setActiveLine(1); // if n === 0
      await delay(speed / 2);
      
      setActiveLine(3); // return n * factorial(n - 1)
      setStatusText(`Waiting for factorial(${i-1}) to resolve...`);
      await delay(speed / 2);
    }
    
    // Base Case
    setActiveLine(0);
    setStatusText(`Calling factorial(0)`);
    tempStack.push({
      id: `call-0`,
      fn: `factorial(0)`,
      status: "resolved",
      val: 0,
      result: 1
    });
    setStack([...tempStack]);
    await delay(speed);
    
    setActiveLine(1); // if n === 0
    await delay(speed / 2);
    
    setActiveLine(2); // return 1;
    setStatusText(`Base case reached! Returning 1.`);
    await delay(speed);

    // POP Phase (Unwinding)
    let currentResult = 1;
    for (let i = tempStack.length - 2; i >= 0; i--) {
      const frame = tempStack[i];
      currentResult = currentResult * frame.val;
      
      setActiveLine(3);
      setStatusText(`factorial(${frame.val}) receives result ${tempStack[i+1].result}`);
      // Mark as active processing
      frame.status = "processing";
      setStack([...tempStack]);
      await delay(speed);
      
      setStatusText(`factorial(${frame.val}) returning ${frame.val} * ${tempStack[i+1].result} = ${currentResult}`);
      // Mark as resolved and pop the one above it
      frame.result = currentResult;
      frame.status = "resolved";
      
      // Remove the base case / previous resolved frame to simulate popping
      tempStack.pop(); 
      setStack([...tempStack]);
      await delay(speed);
    }

    setResult(currentResult);
    setActiveLine(4);
    setStatusText("Call Stack completely resolved.");
    setIsRunning(false);
  };

  const reset = () => {
    setStack([]);
    setResult(null);
    setStatusText("Enter N and click Run to visualize Call Stack.");
    setActiveLine(null);
    setIsRunning(false);
  };

  const CodeBlock = () => {
    const codeLines = [
      "function factorial(n):",                          // 0
      "  if n === 0:",                                   // 1
      "    return 1",                                    // 2
      "  return n * factorial(n - 1)",                   // 3
      "// resolved"                                      // 4
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
            <h1 className="text-3xl font-bold text-white mb-2">Recursion <span className="text-[var(--primary)]">Visualizer</span></h1>
            <p className="text-gray-400">Visualize the call stack pushing and popping frames during recursive execution.</p>
          </div>
          
          <Space size="middle" className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-wrap">
            
            <div className="flex flex-col mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Input (N)</span>
              <InputNumber 
                min={0} 
                max={10} 
                value={inputValue}
                onChange={setInputValue}
                disabled={isRunning}
              />
            </div>
            
            <div className="flex flex-col w-[120px] mx-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Delay</span>
              <Slider 
                min={200} max={2000} step={200} 
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
              onClick={visualizeFactorial} 
              disabled={isRunning}
              icon={<PlayCircleOutlined />}
              className="font-bold shadow-[0_0_15px_rgba(250,204,21,0.4)] h-10 px-6"
            >
              Run factorial({inputValue})
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Left Panel: Stack Section */}
          <Col xs={24} xl={16}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl overflow-hidden rounded-2xl min-h-[600px] h-full flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6">Call Stack (LIFO)</h3>
              
              <div className="flex-1 flex flex-col-reverse items-center justify-end w-full border-b-[4px] border-b-[var(--primary)] pb-2 relative p-4">
                
                {stack.length === 0 && !isRunning && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Stack is empty. Click Run to build the stack.
                  </div>
                )}

                <AnimatePresence>
                  {stack.map((frame, index) => {
                    let bgClass = "bg-[#1e1e24] border-gray-600";
                    let textClass = "text-white";
                    
                    if (frame.status === "processing") {
                      bgClass = "bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
                      textClass = "text-yellow-400";
                    } else if (frame.status === "resolved") {
                      bgClass = "bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                      textClass = "text-green-400";
                    }

                    return (
                      <motion.div
                        key={frame.id}
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className={`w-full max-w-lg mb-3 p-4 rounded-xl border-2 shadow-lg flex justify-between items-center ${bgClass}`}
                      >
                        <div className="font-mono text-lg font-bold text-white">
                          {frame.fn}
                        </div>
                        <div className={`font-mono font-bold ${textClass}`}>
                          {frame.result !== null ? `Return: ${frame.result}` : "Waiting..."}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
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
                    <div className="text-[var(--primary)] font-bold mb-1">Recursive Call Stack</div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      Recursion uses the system's Call Stack (Last-In-First-Out) to store the context of each function call. 
                      It "winds up" the stack until it hits a Base Case, and then it "unwinds," returning values back down the chain.
                    </p>
                    <div className="flex gap-4 text-xs font-mono">
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Time:</span> O(n)</div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Space:</span> O(n)</div>
                    </div>
                  </div>

                  {result !== null && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    >
                      <div className="text-xs text-green-400 font-bold uppercase tracking-widest mb-2">Final Output</div>
                      <div className="text-5xl font-black text-white">{result}</div>
                    </motion.div>
                  )}
                </div>
              </div>

            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default RecursionVisualizer;
