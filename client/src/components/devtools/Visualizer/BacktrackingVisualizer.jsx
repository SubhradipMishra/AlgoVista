"use client";
import React, { useState } from "react";
import { Typography, Card, Button, InputNumber, Space, message, Row, Col, Slider, Divider } from "antd";
import { PlayCircleOutlined, ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const { Title } = Typography;

const BacktrackingVisualizer = () => {
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(8);
  const [board, setBoard] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Animation State
  const [speed, setSpeed] = useState(200); // ms delay
  const [activeLine, setActiveLine] = useState(null);
  const [statusText, setStatusText] = useState("Enter board size (N) and click Run.");

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const initializeBoard = (n) => {
    const newBoard = Array(n).fill(null).map(() => Array(n).fill({ type: 'empty', status: 'default' }));
    setBoard(newBoard);
    return newBoard;
  };

  const updateCell = (b, row, col, type, status) => {
    const newBoard = b.map(r => [...r]);
    newBoard[row][col] = { type, status };
    setBoard(newBoard);
    return newBoard;
  };

  const isSafe = (b, row, col, n) => {
    // Check this row on left side
    for (let i = 0; i < col; i++) {
      if (b[row][i].type === 'queen') return false;
    }
    // Check upper diagonal on left side
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (b[i][j].type === 'queen') return false;
    }
    // Check lower diagonal on left side
    for (let i = row, j = col; i < n && j >= 0; i++, j--) {
      if (b[i][j].type === 'queen') return false;
    }
    return true;
  };

  const solveNQUtil = async (b, col, n) => {
    setActiveLine(1); // if col >= n
    await delay(speed / 2);
    
    if (col >= n) {
      setActiveLine(2); // return true
      return true;
    }

    for (let i = 0; i < n; i++) {
      setActiveLine(3); // for i from 0 to n
      await delay(speed / 2);
      
      setActiveLine(4); // if isSafe
      setStatusText(`Checking if safe to place Queen at [${i}, ${col}]`);
      let currentBoard = updateCell(b, i, col, 'testing', 'checking');
      await delay(speed);

      if (isSafe(currentBoard, i, col, n)) {
        setActiveLine(5); // place queen
        setStatusText(`Safe! Placing Queen at [${i}, ${col}]`);
        currentBoard = updateCell(currentBoard, i, col, 'queen', 'placed');
        await delay(speed);

        setActiveLine(6); // if solveNQUtil(col + 1)
        setStatusText(`Moving to next column: ${col + 1}`);
        await delay(speed / 2);

        if (await solveNQUtil(currentBoard, col + 1, n)) {
          setActiveLine(7); // return true
          return true;
        }

        setActiveLine(8); // backtrack
        setStatusText(`Backtracking: Removing Queen from [${i}, ${col}]`);
        currentBoard = updateCell(currentBoard, i, col, 'empty', 'backtracking');
        await delay(speed);
        // Clear backtrack highlight
        currentBoard = updateCell(currentBoard, i, col, 'empty', 'default');
      } else {
        setStatusText(`Not safe at [${i}, ${col}]. Moving down.`);
        currentBoard = updateCell(currentBoard, i, col, 'empty', 'default');
        await delay(speed / 2);
      }
      b = currentBoard;
    }

    setActiveLine(9); // return false
    return false;
  };

  const runNQueens = async () => {
    if (boardSize < 4 || boardSize > 10) {
      message.error("Please enter a Board Size between 4 and 10");
      return;
    }

    setIsRunning(true);
    setActiveLine(0);
    setStatusText("Initializing Chessboard...");
    let initialBoard = initializeBoard(boardSize);
    await delay(speed);

    const result = await solveNQUtil(initialBoard, 0, boardSize);

    if (result) {
      setStatusText(`Success! Placed ${boardSize} Queens safely.`);
      setActiveLine(10);
    } else {
      setStatusText(`No solution exists for N=${boardSize}.`);
      setActiveLine(10);
    }
    
    setIsRunning(false);
  };

  const reset = () => {
    setBoard([]);
    setStatusText("Enter board size (N) and click Run.");
    setActiveLine(null);
    setIsRunning(false);
  };

  const CodeBlock = () => {
    const codeLines = [
      "function solveNQueens(board, col):",            // 0
      "  if col >= N:",                                // 1
      "    return true  // All placed!",               // 2
      "  for row = 0 to N-1:",                         // 3
      "    if isSafe(board, row, col):",               // 4
      "      board[row][col] = QUEEN",                 // 5
      "      if solveNQueens(board, col + 1):",        // 6
      "        return true",                           // 7
      "      board[row][col] = EMPTY // Backtrack",    // 8
      "  return false",                                // 9
      "// resolved"                                    // 10
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
            <h1 className="text-3xl font-bold text-white mb-2">Backtracking <span className="text-[var(--primary)]">Visualizer</span></h1>
            <p className="text-gray-400">Visualize the N-Queens problem using Recursive Backtracking.</p>
          </div>
          
          <Space size="middle" className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-wrap">
            
            <div className="flex flex-col mr-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Board Size (N)</span>
              <InputNumber 
                min={4} 
                max={10} 
                value={boardSize}
                onChange={setBoardSize}
                disabled={isRunning}
              />
            </div>
            
            <div className="flex flex-col w-[120px] mx-4">
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

            <Button type="default" onClick={reset} disabled={isRunning} icon={<ReloadOutlined />}>Reset</Button>

            <Button 
              type="primary" 
              onClick={runNQueens} 
              disabled={isRunning}
              icon={<PlayCircleOutlined />}
              className="font-bold shadow-[0_0_15px_rgba(250,204,21,0.4)] h-10 px-6"
            >
              Solve N-Queens
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Left Panel: Chessboard */}
          <Col xs={24} xl={16}>
            <Card className="bg-[#111115] border-white/10 shadow-2xl rounded-2xl h-full min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] absolute top-0 left-0 right-0 z-20 w-full flex justify-center">
                <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[var(--primary)] shadow-[0_0_10px_rgba(250,204,21,0.8)] rounded-sm"></div> Safe / Placed</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400/50 border border-yellow-400 rounded-sm"></div> Testing Column</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] rounded-sm"></div> Backtracking (Undo)</div>
                </div>
              </div>

              <div className="mt-16 p-4">
                {board.length > 0 ? (
                  <div 
                    className="grid border-2 border-gray-700 shadow-2xl" 
                    style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
                  >
                    {board.map((row, rowIdx) => (
                      row.map((cell, colIdx) => {
                        const isLight = (rowIdx + colIdx) % 2 === 0;
                        let cellClass = isLight ? "bg-[#e5e5e5]" : "bg-[#8a99a8]"; // standard chess colors
                        
                        if (cell.status === 'checking') cellClass += " ring-inset ring-4 ring-yellow-400 opacity-80";
                        if (cell.status === 'placed') cellClass += " ring-inset ring-4 ring-[var(--primary)] shadow-[inset_0_0_20px_rgba(250,204,21,0.6)]";
                        if (cell.status === 'backtracking') cellClass += " bg-red-500/80 ring-inset ring-4 ring-red-500";
                        
                        const size = boardSize > 8 ? 40 : 55;

                        return (
                          <div 
                            key={`${rowIdx}-${colIdx}`} 
                            className={`flex items-center justify-center transition-all duration-300 ${cellClass}`}
                            style={{ width: size, height: size }}
                          >
                            <AnimatePresence>
                              {(cell.type === 'queen' || cell.type === 'testing') && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: cell.type === 'testing' ? 0.5 : 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  className="text-black font-black"
                                  style={{ fontSize: size * 0.6 }}
                                >
                                  ♕
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">Click Solve N-Queens to start.</div>
                )}
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
                    <div className="text-[var(--primary)] font-bold mb-1">Backtracking</div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      An algorithmic technique for finding solutions by building a candidate incrementally, and abandoning ("backtracking") it as soon as it determines that the candidate cannot possibly be completed to a valid solution.
                    </p>
                    <div className="flex gap-4 text-xs font-mono">
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Time:</span> O(N!)</div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-white/5"><span className="text-gray-500">Space:</span> O(N)</div>
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

export default BacktrackingVisualizer;
