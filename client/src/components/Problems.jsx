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
    <div
      className={`min-h-screen font-mono transition duration-300 ${
        viewDark ? "bg-black text-white" : "bg-white text-black"
      } relative`}
    >
      {/* GRID BG */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none"></div>

      {/* HEADER */}
      <div
        className={`px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-white/10 backdrop-blur-md ${
          viewDark ? "bg-black/70" : "bg-white/70"
        }`}
      >
        {/* Filters */}
        <div className="flex items-center gap-4">
          {/* SEARCH BOX */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm ${
              viewDark
                ? "bg-[#0c0c0c] border-white/10"
                : "bg-gray-100 border-black/20"
            }`}
          >
            <Search size={15} className="opacity-70" />
            <Input
              placeholder="Search problems..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              bordered={false}
              className={`font-mono ${
                viewDark ? "bg-transparent text-white" : "text-black"
              }`}
              style={{ width: 230 }}
            />
          </div>

          <Select value={difficulty} onChange={setDifficulty} className="!w-28 font-mono">
            <Option value="all">All</Option>
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
          </Select>

          <Select value={category} onChange={setCategory} className="!w-36 font-mono">
            <Option value="all">All Tags</Option>
            {categories.map((c) => (
              <Option key={c} value={c === "All" ? "all" : c}>
                {c}
              </Option>
            ))}
          </Select>

          <Select value={sortBy} onChange={setSortBy} className="!w-36 font-mono">
            <Option value="latest">Latest</Option>
            <Option value="most_solved">Most Solved</Option>
            <Option value="difficulty">Difficulty</Option>
          </Select>
        </div>

        <Tooltip title="Theme Switch">
          <Switch checked={viewDark} onChange={setViewDark} />
        </Tooltip>
      </div>

      {/* PROBLEM LIST */}
      <div className="max-w-5xl mx-auto mt-8 px-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 py-10 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 rounded-xl bg-white/10 dark:bg-black/20 border border-white/10"
              ></div>
            ))}
          </div>
        ) : shown.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 pb-10">
              {shown.map((p) => (
                <div
                  key={p._id}
                  className={`group rounded-xl px-6 py-5 border shadow-sm transition-all cursor-pointer
                  ${
                    viewDark
                      ? "bg-[#0d0d0d] border-white/10 hover:bg-[#151515]"
                      : "bg-[#f4f4f4] border-black/10 hover:bg-[#eee]"
                  }
                  hover:-translate-y-1 hover:shadow-md`}
                  onClick={() => navigate(`/problems/${p._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{p.title}</h2>

                      <div className="flex gap-2 mt-3">
                        {p.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-1 border text-xs rounded-md opacity-80 border-white/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="default"
                      className={`font-mono flex items-center gap-2 border px-3 py-2 transition-all rounded-lg 
                      ${
                        viewDark
                          ? "bg-transparent border-white/30 text-white hover:bg-white/10"
                          : "bg-transparent border-black/40 text-black hover:bg-black/5"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/problems/${p._id}`);
                      }}
                    >
                      Solve
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                    </Button>
                  </div>

                  <div className="text-xs opacity-50 mt-3 uppercase">
                    Difficulty: {p.difficulty}
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-end pb-8">
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
                className="font-mono"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-20 opacity-60">No problems found.</div>
        )}
      </div>
    </div>
  );
}
