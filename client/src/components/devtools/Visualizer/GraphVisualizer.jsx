"use client";
import React, { useState, useEffect, useRef } from "react";
import { Typography, Card, Button, Select, Space, message, Row, Col, Slider, Divider, Input } from "antd";
import { PlayCircleOutlined, ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const { Title } = Typography;
const { Option } = Select;

const GraphVisualizer = () => {
  const navigate = useNavigate();
  
  // Inputs
  const [adjInput, setAdjInput] = useState("[[1, 2], [0, 2], [0, 1, 3, 4], [2], [2]]");
  const [startNodeInput, setStartNodeInput] = useState("0");
  const [algorithm, setAlgorithm] = useState("bfs");
  
  // Graph State
  const [adjList, setAdjList] = useState([]);
  const [nodes, setNodes] = useState([]); // { id, x, y, status }
  const [edges, setEdges] = useState([]); // { u, v, status, id }
  
  // Animation State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // ms delay
  const [activeLine, setActiveLine] = useState(null);
  const [statusText, setStatusText] = useState("Ready. Click Build Graph.");
  
  const containerRef = useRef(null);

  // Initialize graph on mount
  useEffect(() => {
    buildGraph();
  }, []); // Run once to load default

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const buildGraph = () => {
    if (isRunning) return;
    
    try {
      // Safely parse the adjacency list input
      // Convert string like "[[1,2], [0]]" into actual array
      // Standard JSON requires double quotes, so we parse carefully or use eval if strict JSON fails, but JSON.parse is safer.
      // To allow user flexibility like single quotes or no quotes, we do a safe string manip.
      let cleanInput = adjInput.trim();
      if (!cleanInput.startsWith("[")) cleanInput = `[${cleanInput}]`;
      const parsedAdj = JSON.parse(cleanInput);
      
      if (!Array.isArray(parsedAdj)) throw new Error("Must be an array of arrays");
      
      setAdjList(parsedAdj);
      
      // Calculate Circular Layout
      const N = parsedAdj.length;
      const radius = 180; // Radius of the circular layout
      const center = { x: 300, y: 250 }; // Center of the SVG canvas
      
      const newNodes = [];
      const newEdges = [];
      const edgeSet = new Set(); // To prevent duplicate undirected edges

      for (let i = 0; i < N; i++) {
        // Distribute evenly around a circle
        const angle = (i / N) * (2 * Math.PI) - (Math.PI / 2); // Start at top
        newNodes.push({
          id: i,
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
          status: 'default'
        });
        
        // Build edges
        const neighbors = parsedAdj[i];
        if (Array.isArray(neighbors)) {
          neighbors.forEach(neighbor => {
            if (neighbor < 0 || neighbor >= N) return; // Invalid neighbor
            // Create unique edge ID (undirected)
            const min = Math.min(i, neighbor);
            const max = Math.max(i, neighbor);
            const edgeId = `${min}-${max}`;
            
            if (!edgeSet.has(edgeId)) {
              edgeSet.add(edgeId);
              newEdges.push({
                u: min,
                v: max,
                id: edgeId,
                status: 'default'
              });
            }
          });
        }
      }
      
      setNodes(newNodes);
      setEdges(newEdges);
      setStatusText(`Graph built with ${N} nodes and ${newEdges.length} edges.`);
      setActiveLine(null);
    } catch (err) {
      message.error("Invalid Adjacency List format. Use [[1,2], [0]]");
    }
  };

  const updateNode = (id, status) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status } : n));
  };

  const updateEdge = (u, v, status) => {
    const min = Math.min(u, v);
    const max = Math.max(u, v);
    const edgeId = `${min}-${max}`;
    setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, status } : e));
  };

  const resetTraversals = () => {
    setNodes(prev => prev.map(n => ({ ...n, status: 'default' })));
    setEdges(prev => prev.map(e => ({ ...e, status: 'default' })));
    setActiveLine(null);
    setStatusText("Graph reset.");
  };

  const runTraversal = async () => {
    if (isRunning) return;
    
    const startNode = parseInt(startNodeInput);
    if (isNaN(startNode) || startNode < 0 || startNode >= adjList.length) {
      message.error("Invalid Start Node.");
      return;
    }

    resetTraversals();
    setIsRunning(true);
    
    // We use local state arrays in the algorithm loop to prevent stale closures,
    // and sync to React state via helper functions.
    
    if (algorithm === 'bfs') {
      await simulateBFS(startNode);
    } else {
      await simulateDFS(startNode);
    }
    
    setIsRunning(false);
  };

  const simulateBFS = async (start) => {
    const visited = new Array(adjList.length).fill(false);
    const queue = [start];
    visited[start] = true;
    
    setActiveLine(1);
    setStatusText(`Initializing Queue with start node ${start}`);
    updateNode(start, 'processing');
    await delay(speed);
    
    while (queue.length > 0) {
      setActiveLine(2);
      await delay(speed / 2);
      
      setActiveLine(3);
      const curr = queue.shift();
      setStatusText(`Processing node ${curr}`);
      updateNode(curr, 'active');
      await delay(speed);
      
      setActiveLine(4);
      const neighbors = adjList[curr];
      setStatusText(`Checking neighbors of ${curr}: [${neighbors.join(', ')}]`);
      await delay(speed);
      
      for (const neighbor of neighbors) {
        setActiveLine(5);
        await delay(speed / 3);
        
        // Highlight edge
        updateEdge(curr, neighbor, 'traversed');
        
        setActiveLine(6);
        if (!visited[neighbor]) {
          setStatusText(`Neighbor ${neighbor} unvisited. Enqueueing.`);
          visited[neighbor] = true;
          updateNode(neighbor, 'processing');
          
          setActiveLine(7);
          queue.push(neighbor);
          await delay(speed);
        } else {
          setStatusText(`Neighbor ${neighbor} already visited. Skipping.`);
          await delay(speed / 2);
        }
      }
      
      updateNode(curr, 'visited');
    }
    
    setActiveLine(8);
    setStatusText("BFS Traversal Complete.");
  };

  const simulateDFS = async (start) => {
    const visited = new Array(adjList.length).fill(false);
    const stack = [start];
    
    setActiveLine(1);
    setStatusText(`Initializing Stack with start node ${start}`);
    await delay(speed);
    
    while (stack.length > 0) {
      setActiveLine(2);
      await delay(speed / 2);
      
      setActiveLine(3);
      const curr = stack.pop();
      
      setActiveLine(4);
      if (!visited[curr]) {
        setStatusText(`Visiting node ${curr}`);
        visited[curr] = true;
        updateNode(curr, 'active');
        await delay(speed);
        
        setActiveLine(5);
        const neighbors = adjList[curr];
        setStatusText(`Pushing neighbors of ${curr}: [${neighbors.join(', ')}]`);
        await delay(speed);
        
        // Iterate backwards so standard left-to-right DFS works properly visually
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i];
          setActiveLine(6);
          
          if (!visited[neighbor]) {
            updateEdge(curr, neighbor, 'traversed');
            setActiveLine(7);
            stack.push(neighbor);
            updateNode(neighbor, 'processing'); // Highlight it's in the stack
            await delay(speed / 2);
          }
        }
        updateNode(curr, 'visited');
      } else {
        setStatusText(`Node ${curr} popped but already visited. Skipping.`);
        await delay(speed / 2);
      }
    }
    
    setActiveLine(8);
    setStatusText("DFS Traversal Complete.");
  };

  const CodeBlock = () => {
    const codeLines = algorithm === 'bfs' ? [
      "function BFS(adjList, start):",                  // 0
      "  queue.push(start); visited[start] = true",     // 1
      "  while queue is not empty:",                    // 2
      "    node = queue.shift()",                       // 3
      "    for neighbor in adjList[node]:",             // 4
      "      check edge(node, neighbor)",               // 5
      "      if neighbor not visited:",                 // 6
      "        queue.push(neighbor); visited = true",   // 7
      "  return"                                        // 8
    ] : [
      "function DFS(adjList, start):",                  // 0
      "  stack.push(start)",                            // 1
      "  while stack is not empty:",                    // 2
      "    node = stack.pop()",                         // 3
      "    if node not visited:",                       // 4
      "      visited[node] = true",                     // 5
      "      for neighbor in adjList[node]:",           // 6
      "        if neighbor not visited:",               // 7
      "          stack.push(neighbor)",                 // 8
      "  return"                                        // 9
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
            <h1 className="text-3xl font-bold text-white mb-2">Graph <span className="text-[var(--primary)]">Visualizer</span></h1>
            <p className="text-gray-400">Topological node-and-edge graphs mapped dynamically from an Adjacency List.</p>
          </div>
          
          <Space size="middle" className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-wrap">
            
            <div className="flex flex-col mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Adjacency List Input</span>
              <div className="flex gap-2">
                <Input 
                  value={adjInput} 
                  onChange={(e) => setAdjInput(e.target.value)} 
                  style={{ width: 220 }} 
                  disabled={isRunning}
                  placeholder="[[1,2], [0]]"
                />
                <Button onClick={buildGraph} disabled={isRunning} type="default">Build</Button>
              </div>
            </div>

            <div className="w-[1px] h-[40px] bg-white/10 mx-1"></div>

            <div className="flex flex-col mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Algorithm</span>
              <div className="flex gap-2">
                <Select 
                  value={algorithm} 
                  onChange={setAlgorithm} 
                  style={{ width: 100 }} 
                  disabled={isRunning}
                >
                  <Option value="bfs">BFS</Option>
                  <Option value="dfs">DFS</Option>
                </Select>
                <Input 
                  value={startNodeInput}
                  onChange={(e) => setStartNodeInput(e.target.value)}
                  placeholder="Start"
                  style={{ width: 60 }}
                  disabled={isRunning}
                />
              </div>
            </div>
            
            <div className="flex flex-col w-[100px] mr-2">
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

            <Button type="default" onClick={resetTraversals} disabled={isRunning} icon={<ReloadOutlined />}>Reset</Button>
            
            <Button 
              type="primary" 
              onClick={runTraversal} 
              disabled={isRunning}
              icon={<PlayCircleOutlined />}
              className="font-bold shadow-[0_0_15px_rgba(250,204,21,0.4)] ml-1 h-10 px-6"
            >
              Run {algorithm.toUpperCase()}
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Left Panel: Graph Canvas */}
          <Col xs={24} xl={16}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl rounded-2xl p-0 min-h-[600px] flex flex-col overflow-hidden relative">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] absolute top-0 left-0 right-0 z-20">
                <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#1e1e24] border border-white/20 rounded-full"></div> Unvisited</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div> In Queue / Stack</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[var(--primary)] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div> Active Processing</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div> Visited (Done)</div>
                </div>
              </div>
              
              <div className="flex-1 w-full h-full min-h-[600px] bg-[#070709]/50 relative flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
                  {/* Edges */}
                  {edges.map(edge => {
                    const nodeU = nodes.find(n => n.id === edge.u);
                    const nodeV = nodes.find(n => n.id === edge.v);
                    if (!nodeU || !nodeV) return null;
                    
                    const isTraversed = edge.status === 'traversed';
                    
                    return (
                      <line
                        key={edge.id}
                        x1={nodeU.x}
                        y1={nodeU.y}
                        x2={nodeV.x}
                        y2={nodeV.y}
                        stroke={isTraversed ? "var(--primary)" : "rgba(255,255,255,0.15)"}
                        strokeWidth={isTraversed ? "4" : "2"}
                        className="transition-all duration-300"
                        style={{ filter: isTraversed ? 'drop-shadow(0 0 8px rgba(250,204,21,0.6))' : 'none' }}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  let bgClass = "bg-[#1e1e24] text-gray-400 border-white/20";
                  if (node.status === 'processing') bgClass = "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]";
                  if (node.status === 'active') bgClass = "bg-[var(--primary)] text-black border-[var(--primary)] shadow-[0_0_25px_rgba(250,204,21,0.8)] scale-110";
                  if (node.status === 'visited') bgClass = "bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]";

                  return (
                    <motion.div
                      key={node.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: node.status === 'active' ? 1.2 : 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className={`absolute w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-2 transition-colors duration-300 z-10 ${bgClass}`}
                      style={{ 
                        left: `${node.x}px`, 
                        top: `${node.y}px`,
                        transform: `translate(-50%, -50%)`
                      }}
                    >
                      {node.id}
                    </motion.div>
                  );
                })}
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
                    <div className="text-[var(--primary)] font-bold mb-1">{algorithm === 'bfs' ? 'Breadth-First Search (BFS)' : 'Depth-First Search (DFS)'} on Adjacency List</div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      Instead of a 2D matrix, graph topology is represented as an array of neighbors. 
                      <code>adjList[i]</code> contains all nodes connected to node <code>i</code>.
                    </p>
                    <div className="flex gap-4 text-xs font-mono">
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Time:</span> O(V + E)</div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Space:</span> O(V)</div>
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

export default GraphVisualizer;
