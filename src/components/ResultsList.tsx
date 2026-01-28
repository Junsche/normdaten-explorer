// src/components/ResultsList.tsx
import type { NormData } from "../types/normdata";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Place: { bg: "#ecfdf5", text: "#065f46" },      // 绿色
  Person: { bg: "#f0f9ff", text: "#075985" },     // 蓝色
  Organization: { bg: "#fff7ed", text: "#9a3412" }, // 橙色
  Thing: { bg: "#f8fafc", text: "#475569" },      // 灰色
};

export function ResultsList({ results, selectedId, onSelect }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {results.map((item: NormData) => {
        const active = item.id === selectedId;
        const colors = TYPE_COLORS[item.type] || TYPE_COLORS.Thing;

        return (
          <button key={item.id} onClick={() => onSelect(item)}
            style={{ textAlign: "left", padding: "20px", borderRadius: "14px", cursor: "pointer", transition: "all 0.2s",
              border: `1px solid ${active ? "#3182ce" : "transparent"}`,
              background: active ? "#eff6ff" : "#ffffff", width: "100%", outline: "none",
              boxShadow: active ? "none" : "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: "12px", fontSize: "15px", lineHeight: 1.4 }}>
              {item.name} 
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, color: "white", background: "#3182ce", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                {item.source}
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, backgroundColor: colors.bg, color: colors.text, padding: "2px 8px", borderRadius: "4px" }}>
                {item.type}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}