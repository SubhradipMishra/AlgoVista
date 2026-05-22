"use client";
import React, { useState } from "react";
import { Typography, Card, Button, Input, Space, message, Row, Col, Slider, Divider } from "antd";
import { PlayCircleOutlined, ReloadOutlined, ArrowLeftOutlined, ApartmentOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title } = Typography;

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

const TreeVisualizer = () => {
  const navigate = useNavigate();
  const [root, setRoot] = useState(null);
  
  // Inputs
  const [singleInput, setSingleInput] = useState("");
  const [bulkInput, setBulkInput] = useState("42, 15, 60, 5, 20, 55, 75");
  
  // Animation State
  const [isInserting, setIsInserting] = useState(false);
  const [speed, setSpeed] = useState(500); // Animation delay in ms
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [treeStructure, setTreeStructure] = useState(null); 
  
  // Code Stepper State
  const [activeLine, setActiveLine] = useState(null);
  const [statusText, setStatusText] = useState("Ready to build tree.");

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const insertSingleNode = async () => {
    const val = parseInt(singleInput);
    if (isNaN(val)) {
      message.warning("Please enter a valid number");
      return;
    }
    setSingleInput("");
    await runInsertion(val);
  };

  const insertBulkArray = async () => {
    const nums = bulkInput.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (nums.length === 0) {
      message.warning("Please enter valid comma-separated numbers");
      return;
    }
    
    // Clear tree before bulk build
    setRoot(null);
    setHighlightedNodes([]);
    
    // Tiny delay so React registers the clear
    await delay(100);

    for (let i = 0; i < nums.length; i++) {
      await runInsertion(nums[i], true);
      // Small pause between insertions
      await delay(200); 
    }
    
    setStatusText("Bulk insertion complete.");
    setActiveLine(null);
  };

  const runInsertion = async (val, isBulk = false) => {
    setIsInserting(true);
    setHighlightedNodes([]);
    
    setActiveLine(0);
    setStatusText(`Preparing to insert ${val}`);
    await delay(speed);

    const newNode = new TreeNode(val);

    // If we're updating state based on previous renders, we need a functional check, but 
    // for this isolated visualizer, mutating the tree reference object and forcing re-render is standard.
    
    setActiveLine(1);
    if (!root && !isBulk && !treeStructure) { // simple check for empty root
      // Because state updates are async, if this is the very first node of a bulk, root is technically null in this closure
      // We handle bulk emptiness inside the loop logic or by tracking a local reference
      
      // Wait, if it's bulk, React state `root` is stale inside this loop. 
      // We must track the root via a local mutable reference if we want bulk to work smoothly without complex hooks.
    }
    
    // We will use a mutable reference to the root to guarantee accuracy during async loops
    // But since this is a React component, let's just do it directly.
    
    // Hack for bulk insertion: we need the latest root. 
    // Since we mutate the `current` node references directly, we can just grab `root` from the state, 
    // unless it's the very first node.
    let currentRoot = root; 
    
    if (!currentRoot) {
      setStatusText(`Tree is empty. Setting ${val} as Root.`);
      setRoot(newNode);
      setTreeStructure(Date.now());
      setActiveLine(2);
      await delay(speed);
      setIsInserting(false);
      return newNode; // Return for bulk tracker
    }

    let current = currentRoot;
    while (true) {
      setActiveLine(3); // while current is not null
      setHighlightedNodes([current.id]);
      setStatusText(`Comparing ${val} with current node ${current.value}`);
      await delay(speed);

      if (val < current.value) {
        setActiveLine(4); // if val < current.val
        setStatusText(`${val} is less than ${current.value}. Moving Left.`);
        await delay(speed);

        setActiveLine(5); // if !current.left
        if (!current.left) {
          setStatusText(`Found empty left slot. Inserting ${val}.`);
          setActiveLine(6); // current.left = new node
          current.left = newNode;
          setHighlightedNodes([current.id, newNode.id]);
          break;
        } else {
          setActiveLine(7); // current = current.left
          current = current.left;
        }
      } else if (val > current.value) {
        setActiveLine(8); // else if val > current.val
        setStatusText(`${val} is greater than ${current.value}. Moving Right.`);
        await delay(speed);

        setActiveLine(9); // if !current.right
        if (!current.right) {
          setStatusText(`Found empty right slot. Inserting ${val}.`);
          setActiveLine(10); // current.right = new node
          current.right = newNode;
          setHighlightedNodes([current.id, newNode.id]);
          break;
        } else {
          setActiveLine(11); // current = current.right
          current = current.right;
        }
      } else {
        setStatusText(`Value ${val} already exists. Skipping.`);
        break; // Duplicate
      }
    }

    setActiveLine(12); // return
    await delay(speed);
    
    setTreeStructure(Date.now()); // Trigger re-render of mutated tree
    setHighlightedNodes([]);
    
    if (!isBulk) {
      setIsInserting(false);
      setStatusText("Insertion complete.");
      setActiveLine(null);
    }
    
    return currentRoot;
  };

  const clearTree = () => {
    if (isInserting) return;
    setRoot(null);
    setHighlightedNodes([]);
    setTreeStructure(null);
    setStatusText("Tree cleared.");
    setActiveLine(null);
  };

  // Code Block Component
  const CodeBlock = () => {
    const codeLines = [
      "function insert(root, val):",                     // 0
      "  if root is null:",                              // 1
      "    return new Node(val)",                        // 2
      "  current = root",                                // 3
      "  if val < current.val:",                         // 4
      "    if current.left is null:",                    // 5
      "      current.left = new Node(val)",              // 6
      "    else current = current.left",                 // 7
      "  else if val > current.val:",                    // 8
      "    if current.right is null:",                   // 9
      "      current.right = new Node(val)",             // 10
      "    else current = current.right",                // 11
      "  return root"                                    // 12
    ];

    return (
      <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden font-mono text-[13px] shadow-inner mb-6">
        {codeLines.map((line, idx) => (
          <div 
            key={idx} 
            className={`px-4 py-1 transition-colors duration-150 ${activeLine === idx ? 'bg-[var(--primary)]/20 text-[var(--primary)] border-l-2 border-[var(--primary)] font-bold' : 'text-green-400/70 border-l-2 border-transparent'}`}
          >
            {line}
          </div>
        ))}
      </div>
    );
  };

  const TreeNodeComponent = ({ node, level = 0 }) => {
    if (!node) return null;
    const isHighlighted = highlightedNodes.includes(node.id);
    const widthConstraint = 600 / Math.pow(2, level);
    
    return (
      <div className="flex flex-col items-center relative" style={{ minWidth: `${widthConstraint}px` }}>
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold z-10 border-2 transition-all duration-300
            ${isHighlighted 
              ? 'bg-[var(--primary)] text-black border-[var(--primary)] shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110' 
              : 'bg-[#1e1e24] text-white border-white/20'}
          `}
        >
          {node.value}
        </motion.div>
        
        <div className="flex justify-center mt-8 relative w-full">
          {(node.left || node.right) && (
            <div className="absolute top-[-32px] w-full h-[32px]">
              {node.left && (
                <svg className="absolute top-0 right-1/2 w-1/2 h-full" preserveAspectRatio="none">
                  <line x1="100%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                </svg>
              )}
              {node.right && (
                <svg className="absolute top-0 left-1/2 w-1/2 h-full" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                </svg>
              )}
            </div>
          )}
          
          {node.left && <div className="w-1/2 flex justify-end"><TreeNodeComponent node={node.left} level={level + 1} /></div>}
          {!node.left && (node.right ? <div className="w-1/2"></div> : null)}
          
          {node.right && <div className="w-1/2 flex justify-start"><TreeNodeComponent node={node.right} level={level + 1} /></div>}
        </div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Tree <span className="text-[var(--primary)]">Visualizer</span></h1>
            <p className="text-gray-400">Binary Search Tree (BST) insertion mapping with step-by-step code tracking.</p>
          </div>
          
          <Space size="middle" className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-wrap">
            
            <div className="flex flex-col mr-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Bulk Insert Array</span>
              <div className="flex gap-2">
                <Input 
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  disabled={isInserting}
                  style={{ width: 180 }}
                  placeholder="e.g. 5, 2, 9"
                />
                <Button type="primary" onClick={insertBulkArray} disabled={isInserting || !bulkInput}>Build Tree</Button>
              </div>
            </div>

            <div className="w-[1px] h-[40px] bg-white/10 mx-2"></div>

            <div className="flex flex-col mr-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Insert Single Node</span>
              <div className="flex gap-2">
                <Input 
                  value={singleInput}
                  onChange={(e) => setSingleInput(e.target.value)}
                  onPressEnter={insertSingleNode}
                  disabled={isInserting}
                  style={{ width: 80 }}
                  placeholder="Val"
                />
                <Button type="primary" ghost onClick={insertSingleNode} disabled={isInserting || !singleInput}>Insert</Button>
              </div>
            </div>

            <div className="flex flex-col w-[120px] mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Delay</span>
              <Slider 
                min={100} max={1500} step={100} 
                value={speed} 
                onChange={setSpeed} 
                disabled={isInserting} 
                tooltip={{ formatter: val => `${val}ms` }}
                className="m-0"
              />
            </div>

            <Button type="default" onClick={clearTree} disabled={isInserting} icon={<ReloadOutlined />}>Clear</Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Left Panel: Tree Canvas */}
          <Col xs={24} xl={16}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl overflow-hidden rounded-2xl min-h-[600px] flex justify-center py-12 relative h-full">
              {root ? (
                <div className="flex justify-center w-full overflow-x-auto absolute inset-0 top-12">
                  <TreeNodeComponent node={root} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 h-full w-full opacity-50 mt-20">
                  <ApartmentOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                  <p>Tree is empty. Use Bulk Build or insert a single node.</p>
                </div>
              )}
            </Card>
          </Col>

          {/* Right Panel: Explanation & Code Stepper */}
          <Col xs={24} xl={8}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl rounded-2xl h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Execution Trace</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isInserting ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                  {isInserting ? 'Running' : 'Idle'}
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
                    <div className="text-[var(--primary)] font-bold mb-1">Binary Search Tree (BST)</div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      A BST is a node-based binary tree data structure which has the following properties:
                      <ul className="list-disc pl-4 mt-2">
                        <li>The left subtree of a node contains only nodes with keys lesser than the node's key.</li>
                        <li>The right subtree of a node contains only nodes with keys greater than the node's key.</li>
                        <li>No duplicate nodes (usually).</li>
                      </ul>
                    </p>
                    <div className="flex gap-4 text-xs font-mono">
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Time (Avg):</span> O(log n)</div>
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

export default TreeVisualizer;
