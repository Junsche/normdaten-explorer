// src/components/DetailPanel.tsx
import type { NormData } from "../types/normdata";

export function DetailPanel({ item }: { item: NormData | null }) {
  if (!item) {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
        height: "100%", minHeight: "400px", color: "#94a3b8", gap: "16px" 
      }}>
        <div style={{ fontSize: "48px", opacity: 0.2 }}>🔍</div>
        <div style={{ fontSize: "15px", fontWeight: 500 }}>Select an entity to explore metadata</div>
      </div>
    );
  }

  // --- 1. 坐标提取器 ---
  const getCoord = (val: any): number | null => {
    if (!val) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const parsed = parseFloat(val); return isNaN(parsed) ? null : parsed; }
    if (Array.isArray(val)) return getCoord(val[0]);
    if (typeof val === 'object' && val.value) return getCoord(val.value);
    return null;
  };

  const lat = getCoord(item.latitude);
  const lon = getCoord(item.longitude);
  const hasLocation = lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon);

  // --- 2. 地图链接 ---
  const googleMapsUrl = hasLocation ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}` : "#";
  const osmUrl = hasLocation ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}` : "#";

  // --- 3. 复杂数据渲染器 (解决 [object Object]) ---
  const renderComplexValue = (val: any): string => {
    if (!val || val === "-") return "-";
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (Array.isArray(val)) {
      if (val.length === 0) return "-";
      if (typeof val[0] === 'string') return val.join(", ");
      if (typeof val[0] === 'object' && val[0] !== null && 'value' in val[0]) {
        return val.map((v: any) => v.value).join(", ");
      }
      return JSON.stringify(val);
    }
    if (typeof val === 'object') {
      if (val.value) return renderComplexValue(val.value);
      return JSON.stringify(val);
    }
    return String(val);
  };

  // --- 4. [新增] Geonames Description 解析器 ---
  // 专门处理 "population=936; timezone=Europe/Berlin" 这种格式
  const parseGeonamesDescription = (desc: any) => {
    const text = renderComplexValue(desc);
    
    // 如果包含特定的 geonames 格式字符，尝试解析
    if (text.includes("population=") || text.includes("timezone=")) {
      const parts = text.split(';').map(s => s.trim());
      const tags: { label: string; value: string }[] = [];
      let remainingText = "";

      parts.forEach(part => {
        if (part.startsWith("population=")) {
          tags.push({ label: "👥 Population", value: part.replace("population=", "") });
        } else if (part.startsWith("timezone=")) {
          tags.push({ label: "🕒 Timezone", value: part.replace("timezone=", "") });
        } else {
          remainingText += part + " ";
        }
      });

      return { tags, text: remainingText.trim() }; // 返回结构化标签和剩余文本
    }

    return { tags: [], text }; // 普通文本直接返回
  };

  const { tags: geoTags, text: descriptionText } = parseGeonamesDescription(item.description);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* 头部区域 */}
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
          <span style={{ background: "#3182ce", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {item.source}
          </span>
          <span style={{ background: "#f1f5f9", color: "#64748b", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.5px" }}>
            ID: {item.id}
          </span>
        </div>
        
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#1e293b", margin: "0 0 12px 0", lineHeight: 1.2 }}>
          {item.name}
        </h1>
        
        {/* 新增：展示 Geonames 的 Population 和 Timezone 标签 */}
        {geoTags.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
            {geoTags.map((tag, idx) => (
              <span key={idx} style={{ 
                background: "#ecfdf5", color: "#047857", border: "1px solid #d1fae5",
                padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center" 
              }}>
                {tag.label}: {tag.value}
              </span>
            ))}
          </div>
        )}

        {/* 描述文本 (如果有剩余文本才显示) */}
        {descriptionText && descriptionText !== "-" && (
          <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "800px", marginTop: "16px" }}>
            {descriptionText}
          </p>
        )}
      </div>

      {/* 地图预览 (Iframe) */}
      {hasLocation ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "100%", height: "400px", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon! - 0.005}%2C${lat! - 0.005}%2C${lon! + 0.005}%2C${lat! + 0.005}&layer=mapnik&marker=${lat}%2C${lon}`}
              style={{ border: 0 }}
              title="Map Preview"
            ></iframe>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <a href={osmUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: "#3182ce", color: "white", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 4px rgba(49, 130, 206, 0.2)" }}>
              <span>🌍</span> OpenStreetMap
            </a>
            <a href={googleMapsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: "white", color: "#374151", border: "1px solid #e5e7eb", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <span>🗺️</span> Google Maps
            </a>
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", height: "160px", background: "#f8fafc", borderRadius: "16px", border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>📍</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>No geographic coordinates available</span>
        </div>
      )}

      {/* 详细数据表格 */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "32px", marginTop: "16px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Metadata Attributes
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", tableLayout: "fixed" }}>
          <tbody>
            {[
              { label: "Identifier", value: item.id },
              { label: "Entity Type", value: item.type },
              { label: "Data Source", value: item.source },
              { label: "Official Link", value: item.url || item.mainEntityOfPage },
              { label: "Alt. Names", value: item.alternateName },
              // 如果 description 包含 population/timezone，我们就不在表格里重复显示原始字符串了，除非有剩余文本
              { label: "Description", value: descriptionText || "-" },
              { label: "Address", value: item.address }
            ].map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px 0", color: "#64748b", fontWeight: 600, width: "160px", verticalAlign: "top" }}>{row.label}</td>
                <td style={{ padding: "16px 0", color: "#1e293b", wordWrap: "break-word", lineHeight: 1.6 }}>
                  {row.label === "Official Link" && row.value && row.value !== "-" ? (
                    <a href={String(row.value)} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", textUnderlineOffset: "2px" }}>{String(row.value)}</a>
                  ) : (
                    renderComplexValue(row.value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}