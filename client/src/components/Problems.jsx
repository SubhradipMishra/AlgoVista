import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Input,
  Select,
  Button,
  Switch,
  Pagination,
  Tooltip,
  Spin,
} from "antd";
import { Search, ArrowRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function Problems() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [viewDark, setViewDark] = useState(true);

  // Debounce timer
  const [typingTimeout, setTypingTimeout] = useState(null);

  const categories = useMemo(
    () => ["All", "Array", "String", "Math", "DP", "Hash", "Greedy", "Graph"],
    []
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/problem");
        const arr = Array.isArray(res.data.problems) ? res.data.problems : [];

        const normalized = arr.map((p) => ({
          _id: p._id,
          title: p.title || "Untitled",
          difficulty: p.difficulty?.toLowerCase() || "easy",
          tags: p.tags || [],
          createdAt: p.createdAt || Date.now(),
          solvedCount: p.solvedCount || 0,
          ...p,
        }));

        setProblems(normalized);
        setFilteredProblems(normalized);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // APPLY FILTERS
  const applyFilters = useCallback(() => {
    let arr = [...problems];

    if (difficulty !== "all") arr = arr.filter((p) => p.difficulty === difficulty);
    if (category !== "all") arr = arr.filter((p) => p.tags.includes(category));

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "latest")
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "difficulty") {
      const map = { easy: 0, medium: 1, hard: 2 };
      arr.sort((a, b) => map[a.difficulty] - map[b.difficulty]);
    } else if (sortBy === "most_solved")
      arr.sort((a, b) => (b.solvedCount || 0) - (a.solvedCount || 0));

    setFilteredProblems(arr);
    setPage(1);
  }, [problems, difficulty, category, searchText, sortBy]);

  // Debounced search/filter trigger
  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(applyFilters, 300);
    setTypingTimeout(t);
    return () => clearTimeout(t);
  }, [searchText, difficulty, category, sortBy, problems]);

  const shown = filteredProblems.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[rgba(250,204,21,0.02)] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[rgba(250,204,21,0.01)] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-28 relative z-10 font-mono">
        
        {/* Header section */}
        <div className="mb-10 text-center sm:text-left relative">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2 text-xs font-black tracking-widest text-[var(--primary)] uppercase">
            <span>◈ Test Your Algorithms</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
            Coding Challenges
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl">
            Solve curated algorithmic challenges and level up your data structures knowledge.
          </p>
          <div className="h-px bg-gradient-to-r from-[rgba(250,204,21,0.2)] to-transparent mt-6 w-44 mx-auto sm:mx-0" />
        </div>

        {/* ================= CONTROLS HUD ================= */}
        <div className="mb-8 p-5 rounded-3xl border border-[rgba(250,204,21,0.15)] bg-[#07070a]/95 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Search Box */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-900 bg-black/80 w-full md:w-72 focus-within:border-[var(--primary)] transition-all duration-300">
              <Search size={14} className="text-gray-500" />
              <Input
                placeholder="Search problems by name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                bordered={false}
                className="font-mono text-xs text-white placeholder-gray-600 w-full"
              />
            </div>

            {/* Select controls */}
            <Select 
              value={difficulty} 
              onChange={setDifficulty} 
              className="font-mono text-xs min-w-[110px]"
              popupClassName="font-mono text-xs"
            >
              <Option value="all">Difficulty: All</Option>
              <Option value="easy">Easy</Option>
              <Option value="medium">Medium</Option>
              <Option value="hard">Hard</Option>
            </Select>

            <Select 
              value={category} 
              onChange={setCategory} 
              className="font-mono text-xs min-w-[130px]"
              popupClassName="font-mono text-xs"
            >
              <Option value="all">Category: All</Option>
              {categories.map((c) => (
                <Option key={c} value={c === "All" ? "all" : c}>
                  {c}
                </Option>
              ))}
            </Select>

            <Select 
              value={sortBy} 
              onChange={setSortBy} 
              className="font-mono text-xs min-w-[130px]"
              popupClassName="font-mono text-xs"
            >
              <Option value="latest">Sort: Latest</Option>
              <Option value="most_solved">Sort: Most Solved</Option>
              <Option value="difficulty">Sort: Difficulty</Option>
            </Select>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {filteredProblems.length} challenges found
          </div>
        </div>

        {/* ================= PROBLEM LIST ================= */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 py-10 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 rounded-2xl bg-[#07070a] border border-gray-900"
              ></div>
            ))}
          </div>
        ) : shown.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 pb-10">
              {shown.map((p) => {
                const diffColor = 
                  p.difficulty === "easy" 
                    ? "text-green-400 bg-green-950/20 border-green-900/30" 
                    : p.difficulty === "medium" 
                    ? "text-amber-400 bg-amber-950/20 border-amber-900/30" 
                    : "text-red-400 bg-red-950/20 border-red-900/30";

                return (
                  <div
                    key={p._id}
                    className="group relative rounded-2xl px-6 py-5 bg-[#07070a]/95 border border-gray-900 hover:border-[var(--primary)] hover:shadow-[0_0_30px_rgba(250,204,21,0.06)] hover:-translate-y-0.5 transition-all duration-500 cursor-pointer flex flex-col justify-between"
                    onClick={() => navigate(`/problems/${p._id}`)}
                  >
                    {/* HUD Corner Brackets */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)] opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[var(--primary)] opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[var(--primary)] opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[var(--primary)] opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none"></div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-wide group-hover:text-[var(--primary)] transition-colors">
                          {p.title}
                        </h2>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {/* Difficulty badge */}
                          <span className={`text-[9px] font-bold px-2 py-0.5 border rounded uppercase tracking-wider ${diffColor}`}>
                            {p.difficulty}
                          </span>
                          
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-bold text-gray-500 bg-black border border-gray-900 px-2 py-0.5 rounded uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        type="default"
                        className="font-mono text-[10px] font-black uppercase tracking-widest bg-[var(--primary)] text-black border-none hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/problems/${p._id}`);
                        }}
                      >
                        Solve
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center md:justify-end pb-8">
              <Pagination
                current={page}
                total={filteredProblems.length}
                pageSize={pageSize}
                onChange={(pNum, pSize) => {
                  setPage(pNum);
                  setPageSize(pSize);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                showSizeChanger
                className="font-mono text-xs uppercase"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500 text-xs font-bold uppercase tracking-widest">No challenges found.</div>
        )}
      </main>
    </div>
  );
}
