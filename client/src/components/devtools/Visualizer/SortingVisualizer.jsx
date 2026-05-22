"use client";
import React, { useState, useEffect } from "react";
import { Typography, Card, Button, Input, Space, message, Row, Col, Slider, Select, Divider } from "antd";
import { PlayCircleOutlined, ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title } = Typography;
const { Option } = Select;

const SortingVisualizer = () => {
  const navigate = useNavigate();
  
  // Inputs
  const [arrayInput, setArrayInput] = useState("64, 34, 25, 12, 22, 11, 90");
  const [algorithm, setAlgorithm] = useState("bubble");
  
  // Sorting State
  const [array, setArray] = useState([]);
  const [barStates, setBarStates] = useState([]); // 'default', 'comparing', 'swapping', 'sorted'
  
  // Animation State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300); // ms delay
  const [activeLine, setActiveLine] = useState(null);
  const [statusText, setStatusText] = useState("Ready to sort.");

  useEffect(() => {
    generateArray();
  }, []);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const generateArray = () => {
    if (isRunning) return;
    
    const nums = arrayInput.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (nums.length === 0) {
      message.warning("Please enter valid comma-separated numbers");
      return;
    }
    
    setArray([...nums]);
    setBarStates(new Array(nums.length).fill('default'));
    setActiveLine(null);
    setStatusText("Array generated.");
  };

  const generateRandomArray = () => {
    if (isRunning) return;
    const randomNums = Array.from({ length: 15 }, () => Math.floor(Math.random() * 90) + 10);
    setArrayInput(randomNums.join(", "));
    setArray([...randomNums]);
    setBarStates(new Array(randomNums.length).fill('default'));
    setActiveLine(null);
    setStatusText("Random array generated.");
  };

  const updateBarState = (indices, state) => {
    setBarStates(prev => {
      const newStates = [...prev];
      indices.forEach(i => { if (newStates[i] !== 'sorted') newStates[i] = state; });
      return newStates;
    });
  };

  const resetBarStates = () => {
    setBarStates(prev => prev.map(s => s === 'sorted' ? 'sorted' : 'default'));
  };

  const runSorting = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setBarStates(new Array(array.length).fill('default'));
    
    // We use a local copy of the array for algorithmic tracking, 
    // and sync it to the React state array for rendering.
    let arrCopy = [...array];
    
    if (algorithm === 'bubble') {
      await simulateBubbleSort(arrCopy);
    } else if (algorithm === 'quick') {
      await simulateQuickSort(arrCopy, 0, arrCopy.length - 1);
      // Mark all as sorted when done
      setBarStates(new Array(arrCopy.length).fill('sorted'));
      setActiveLine(10);
      setStatusText("Quick Sort Complete.");
    }
    
    setIsRunning(false);
  };

  const simulateBubbleSort = async (arr) => {
    let n = arr.length;
    let swapped;
    
    setActiveLine(1);
    setStatusText("Starting Bubble Sort. Looping through array.");
    await delay(speed);

    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      setActiveLine(2);
      await delay(speed / 2);
      
      for (let j = 0; j < n - i - 1; j++) {
        setActiveLine(3); // for j
        
        // Comparing
        updateBarState([j, j + 1], 'comparing');
        setStatusText(`Comparing index ${j} (${arr[j]}) and index ${j+1} (${arr[j+1]})`);
        setActiveLine(4); // if arr[j] > arr[j+1]
        await delay(speed);

        if (arr[j] > arr[j + 1]) {
          // Swapping
          setStatusText(`Swapping ${arr[j]} and ${arr[j+1]}`);
          updateBarState([j, j + 1], 'swapping');
          setActiveLine(5); // swap
          
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArray([...arr]);
          
          swapped = true;
          setActiveLine(6); // swapped = true
          await delay(speed);
        }
        
        resetBarStates();
      }
      
      // The last element bubbled up is now sorted
      setBarStates(prev => {
        const newStates = [...prev];
        newStates[n - i - 1] = 'sorted';
        return newStates;
      });
      
      setActiveLine(7); // if not swapped break
      if (!swapped) break;
    }
    
    // Mark all remaining as sorted
    setBarStates(new Array(n).fill('sorted'));
    setActiveLine(8); // return
    setStatusText("Bubble Sort Complete.");
  };

  const simulateQuickSort = async (arr, low, high) => {
    if (low < high) {
      setActiveLine(1); // if low < high
      await delay(speed / 2);
      
      setActiveLine(2); // pi = partition(arr, low, high)
      let pi = await partition(arr, low, high);
      
      // Pivot is now in correct sorted place
      setBarStates(prev => {
        const newStates = [...prev];
        newStates[pi] = 'sorted';
        return newStates;
      });
      
      setActiveLine(3); // quicksort(arr, low, pi - 1)
      await simulateQuickSort(arr, low, pi - 1);
      
      setActiveLine(4); // quicksort(arr, pi + 1, high)
      await simulateQuickSort(arr, pi + 1, high);
    } else if (low === high) {
      // Single element is sorted
      setBarStates(prev => {
        const newStates = [...prev];
        newStates[low] = 'sorted';
        return newStates;
      });
    }
  };

  const partition = async (arr, low, high) => {
    let pivot = arr[high];
    setActiveLine(5); // pivot = arr[high]
    setStatusText(`Partitioning from ${low} to ${high}. Pivot is ${pivot}`);
    updateBarState([high], 'comparing'); // highlight pivot
    await delay(speed);

    let i = low - 1;
    setActiveLine(6); // i = low - 1
    
    for (let j = low; j < high; j++) {
      setActiveLine(7); // for j = low to high - 1
      updateBarState([j, high], 'comparing');
      await delay(speed / 2);
      
      setActiveLine(8); // if arr[j] < pivot
      if (arr[j] < pivot) {
        i++;
        setActiveLine(9); // swap arr[i], arr[j]
        setStatusText(`Swapping ${arr[i]} and ${arr[j]}`);
        updateBarState([i, j], 'swapping');
        
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        setArray([...arr]);
        
        await delay(speed);
      }
      resetBarStates();
    }
    
    setActiveLine(9); // swap arr[i+1], arr[high]
    setStatusText(`Placing pivot ${pivot} in correct position`);
    updateBarState([i + 1, high], 'swapping');
    
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    setArray([...arr]);
    
    await delay(speed);
    resetBarStates();
    
    setActiveLine(10); // return i + 1
    return i + 1;
  };

  const CodeBlock = () => {
    const codeLines = algorithm === 'bubble' ? [
      "function bubbleSort(arr):",                       // 0
      "  for i from 0 to n-1:",                          // 1
      "    swapped = false",                             // 2
      "    for j from 0 to n-i-1:",                      // 3
      "      if arr[j] > arr[j+1]:",                     // 4
      "        swap(arr[j], arr[j+1])",                  // 5
      "        swapped = true",                          // 6
      "    if not swapped: break",                       // 7
      "  return arr"                                     // 8
    ] : [
      "function quickSort(arr, low, high):",             // 0
      "  if low < high:",                                // 1
      "    pi = partition(arr, low, high)",              // 2
      "    quickSort(arr, low, pi - 1)",                 // 3
      "    quickSort(arr, pi + 1, high)",                // 4
      "function partition(arr, low, high):",             // 5
      "  pivot = arr[high]; i = low - 1",                // 6
      "  for j from low to high - 1:",                   // 7
      "    if arr[j] < pivot:",                          // 8
      "      i++; swap(arr[i], arr[j])",                 // 9
      "  swap(arr[i + 1], arr[high]); return i + 1"      // 10
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
            <h1 className="text-3xl font-bold text-white mb-2">Sorting <span className="text-[var(--primary)]">Visualizer</span></h1>
            <p className="text-gray-400">Step-by-step array sorting with real-time code execution tracking.</p>
          </div>
          
          <Space size="middle" className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-wrap">
            
            <div className="flex flex-col mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Custom Array</span>
              <div className="flex gap-2">
                <Input 
                  value={arrayInput} 
                  onChange={(e) => setArrayInput(e.target.value)} 
                  style={{ width: 220 }} 
                  disabled={isRunning}
                  placeholder="e.g. 5, 2, 9"
                />
                <Button onClick={generateArray} disabled={isRunning} type="default">Set</Button>
                <Button onClick={generateRandomArray} disabled={isRunning} type="dashed">Random</Button>
              </div>
            </div>

            <div className="w-[1px] h-[40px] bg-white/10 mx-1"></div>

            <div className="flex flex-col mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Algorithm</span>
              <Select 
                value={algorithm} 
                onChange={setAlgorithm} 
                style={{ width: 140 }} 
                disabled={isRunning}
              >
                <Option value="bubble">Bubble Sort</Option>
                <Option value="quick">Quick Sort</Option>
              </Select>
            </div>
            
            <div className="flex flex-col w-[120px] mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Delay</span>
              <Slider 
                min={50} max={1000} step={50} 
                value={speed} 
                onChange={setSpeed} 
                disabled={isRunning} 
                tooltip={{ formatter: val => `${val}ms` }}
                className="m-0"
              />
            </div>

            <Button 
              type="primary" 
              onClick={runSorting} 
              disabled={isRunning}
              icon={<PlayCircleOutlined />}
              className="font-bold shadow-[0_0_15px_rgba(250,204,21,0.4)] h-10 px-6"
            >
              Run {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Left Panel: Canvas */}
          <Col xs={24} xl={16}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl rounded-2xl p-0 h-full min-h-[500px] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[var(--primary)] rounded-sm"></div> Default</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div> Comparing</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div> Swapping</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div> Sorted</div>
                </div>
              </div>
              
              <div className="flex-1 w-full h-full p-8 flex items-end justify-center gap-2 bg-[#070709]/50 overflow-x-auto">
                {array.map((val, idx) => {
                  const maxVal = Math.max(...array);
                  const heightPercent = (val / maxVal) * 100;
                  
                  let bgClass = "bg-[var(--primary)]"; // default
                  const state = barStates[idx];
                  
                  if (state === 'comparing') bgClass = "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]";
                  if (state === 'swapping') bgClass = "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]";
                  if (state === 'sorted') bgClass = "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]";

                  return (
                    <motion.div
                      key={idx}
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`relative rounded-t-md flex items-end justify-center transition-colors duration-200 ${bgClass}`}
                      style={{ 
                        height: `${Math.max(10, heightPercent)}%`, 
                        width: `${Math.max(20, 600 / array.length)}px`,
                        minWidth: '20px'
                      }}
                    >
                      <span className="absolute -top-6 text-xs font-bold text-gray-300">{val}</span>
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
                    <div className="text-[var(--primary)] font-bold mb-1">{algorithm === 'bubble' ? 'Bubble Sort' : 'Quick Sort'}</div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      {algorithm === 'bubble' 
                        ? 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.'
                        : 'A highly efficient Divide and Conquer algorithm. It picks an element as a pivot and partitions the given array around the picked pivot, placing it in its exact sorted position.'}
                    </p>
                    <div className="flex gap-4 text-xs font-mono">
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Time (Avg):</span> {algorithm === 'bubble' ? 'O(n²)' : 'O(n log n)'}</div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Space:</span> {algorithm === 'bubble' ? 'O(1)' : 'O(log n)'}</div>
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

export default SortingVisualizer;
