// src/pages/ExplorerPage.tsx
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { ResultsList } from "../components/ResultsList";
import { DetailPanel } from "../components/DetailPanel";
import { searchNormdata } from "../api/client";
import type { NormData } from "../types/normdata";

export function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [pageSize] = useState(20);
  const [maxLimit, setMaxLimit] = useState(100);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<NormData[]>([]);
  const [selected, setSelected] = useState<NormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    const runSearch = async () => {
      if (!query.trim() && selectedTypes.length === 0 && selectedSources.length === 0) {
        setResults([]); setTotal(0); return;
      }
      setLoading(true);
      const { total: t, hits } = await searchNormdata(query, selectedTypes, selectedSources, pageSize, page, maxLimit);
      setResults(hits); setTotal(t);
      setLoading(false);
    };
    const timer = setTimeout(runSearch, 400);
    return () => clearTimeout(timer);
  }, [query, selectedTypes, selectedSources, page, maxLimit]);

  const toggle = (list: string[], item: string, setFn: Function) => {
    setFn(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    setPage(1);
  };

  return (
    // 全局布局：minHeight 允许页面纵向滚动，width: 100% 铺满横向
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      
      {/* 1. Header 居中展示 */}
      <header style={{ background: "white", padding: "16px 0", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "center" }}>
        <Header />
      </header>

      {/* 2. 主体内容：去除 maxWidth，使用 flex-col 布局 */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 40px", width: "100%", boxSizing: "border-box" }}>
        
        {/* 搜索栏：全宽自适应 */}
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", marginBottom: "24px", border: "1px solid #edf2f7", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-end", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", display: "block", marginBottom: "8px" }}>SEARCH TERM</label>
              <SearchBar query={query} onChange={(v) => { setQuery(v); setPage(1); }} />
            </div>
            <div style={{ width: "240px" }}>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", display: "block", marginBottom: "8px" }}>MAX RESULTS</label>
              <select value={maxLimit} onChange={(e) => { setMaxLimit(Number(e.target.value)); setPage(1); }}
                style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "2px solid #f1f5f9", background: "#f8fafc", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                <option value={100}>Top 100 Results</option>
                <option value={500}>Top 500 Results</option>
                <option value={1000}>Top 1,000 Results</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", display: "block", marginBottom: "12px" }}>SOURCES</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["gnd", "wikidata", "osm", "geonames"].map(s => (
                  <button key={s} onClick={() => toggle(selectedSources, s, setSelectedSources)}
                    style={{ padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, border: "1px solid #e2e8f0", cursor: "pointer",
                      background: selectedSources.includes(s) ? "#3182ce" : "white", color: selectedSources.includes(s) ? "white" : "#64748b" }}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", display: "block", marginBottom: "12px" }}>ENTITY TYPES</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["Person", "Place", "Organization", "Thing"].map(t => (
                  <button key={t} onClick={() => toggle(selectedTypes, t, setSelectedTypes)}
                    style={{ padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, border: "1px solid #e2e8f0", cursor: "pointer",
                      background: selectedTypes.includes(t) ? (t === "Thing" ? "#475569" : "#10b981") : "white", color: selectedTypes.includes(t) ? "white" : "#64748b" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. 内容展示区：Flex 布局，右侧填充剩余空间 */}
        <div style={{ display: "flex", gap: "24px", width: "100%", alignItems: "flex-start" }}>
          
          {/* 左侧列表：Sticky 布局 + 内部滚动 */}
          {isSidebarVisible && (
            <section style={{ 
              width: "400px", flexShrink: 0, 
              background: "white", borderRadius: "16px", border: "1px solid #edf2f7", 
              // 关键：吸附在顶部，且限制最大高度为视口高度减去顶部间距，保证翻页按钮可见
              position: "sticky", top: "20px", maxHeight: "calc(100vh - 40px)", display: "flex", flexDirection: "column"
            }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: "16px 16px 0 0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b" }}>HITS: {total}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ cursor: "pointer", border: "1px solid #e2e8f0", background: "white", padding: "2px 8px", borderRadius: "4px" }}>←</button>
                  <span style={{ fontSize: "12px", fontWeight: 700 }}>{page}</span>
                  <button disabled={results.length < pageSize || (page * pageSize) >= total} onClick={() => setPage(p => p + 1)} style={{ cursor: "pointer", border: "1px solid #e2e8f0", background: "white", padding: "2px 8px", borderRadius: "4px" }}>→</button>
                </div>
              </div>
              {/* 列表内部滚动 */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                <ResultsList results={results} selectedId={selected?.id ?? null} onSelect={setSelected} />
              </div>
            </section>
          )}

          {/* 右侧详情：使用 flex: 1 强行占满剩余宽度，消除空白 */}
          <section style={{ flex: 1, minWidth: 0, background: "white", borderRadius: "16px", border: "1px solid #edf2f7", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", background: "#fcfcfc", borderRadius: "16px 16px 0 0" }}>
              <button 
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                style={{ background: "#3182ce", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                {isSidebarVisible ? "⇥ Maximize Detail" : "⇤ Show Results"}
              </button>
            </div>
            {/* 详情内容 */}
            <div style={{ padding: "30px" }}>
              <DetailPanel item={selected} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}