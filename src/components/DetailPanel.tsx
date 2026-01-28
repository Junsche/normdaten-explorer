// src/components/DetailPanel.tsx
import type { NormData } from "../types/normdata";

export function DetailPanel({ item }: { item: NormData | null }) {
  if (!item) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "400px", color: "#94a3b8", gap: "16px" }}>
        <div style={{ fontSize: "48px", opacity: 0.2 }}>🔍</div>
        <div style={{ fontSize: "15px", fontWeight: 500 }}>Select an entity to explore metadata</div>
      </div>
    );
  }

  // --- 1. 基础数据提取 ---
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

  const getLogoUrl = (val: any): string | null => {
    if (!val) return null;
    const raw = Array.isArray(val) ? val[0] : val;
    if (typeof raw === 'object' && raw.value) return raw.value; 
    return typeof raw === 'string' && raw.startsWith('http') ? raw : null;
  };
  const logoUrl = getLogoUrl(item.logo);

  // --- 2. 链接生成 ---
  const googleMapsUrl = hasLocation ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}` : "#";
  const osmUrl = hasLocation ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}` : "#";

  // --- 3. 核心：复杂值清洗器 ---
  const renderComplexValue = (val: any): string => {
    if (!val || val === "-") return "";
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (Array.isArray(val)) {
      if (val.length === 0) return "";
      // 递归处理数组项，如果是对象取value，如果是字符串直接用
      const items = val.map(v => {
          if (typeof v === 'object' && v !== null && 'value' in v) return v.value;
          return v;
      });
      return items.join(", ");
    }
    if (typeof val === 'object') {
      if (val.value) return renderComplexValue(val.value);
      // 如果对象里没有 value 字段，尝试 JSON 字符串化，或者忽略
      return JSON.stringify(val);
    }
    return String(val);
  };

  // --- 4. 辅助：驼峰转标题 (e.g. "foundingDate" -> "Founding Date") ---
  const formatKey = (key: string) => {
    // 1. 在大写字母前加空格 2. 首字母大写
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // --- 5. Geonames 描述解析 ---
  const parseGeonamesDescription = (desc: any) => {
    const text = renderComplexValue(desc);
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
      return { tags, text: remainingText.trim() };
    }
    return { tags: [], text };
  };
  const { tags: geoTags, text: descriptionText } = parseGeonamesDescription(item.description);

  // --- 6. 核心：动态生成所有字段行 ---
  // 这些字段已经在 UI 的其他地方（头部、地图、Logo区）展示过了，表格里跳过它们
  const handledKeys = new Set([
    "id", "name", "type", "source", "description", "logo", 
    "latitude", "longitude", "geometry", "coordinate", // 地理坐标不显示在表格文字里
    "score", "_index", "_id", "_score", "_type" // 系统字段过滤
  ]);

  // 1. 提取所有键值对
  const allEntries = Object.entries(item);
  
  // 2. 过滤并格式化
  const tableRows = allEntries
    .filter(([key, val]) => {
      // 过滤掉已处理字段 和 空值
      if (handledKeys.has(key)) return false;
      const str = renderComplexValue(val);
      return str && str !== "" && str !== "[]" && str !== "{}";
    })
    .map(([key, val]) => {
        return {
            key: key,
            label: formatKey(key),
            value: renderComplexValue(val),
            isLink: key.toLowerCase().includes("url") || key.toLowerCase().includes("link") || key === "mainEntityOfPage" || key === "sameAs"
        };
    })
    // 3. 排序：把 identifier 放在第一位，其他按字母顺序 (可选)
    .sort((a, b) => {
        if (a.key === 'identifier') return -1;
        if (b.key === 'identifier') return 1;
        return a.key.localeCompare(b.key);
    });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* --- 头部区域 --- */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {logoUrl && (
          <div style={{ width: "80px", height: "80px", flexShrink: 0, borderRadius: "12px", border: "1px solid #e2e8f0", padding: "4px", background: "white" }}>
            <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
            <span style={{ background: "#3182ce", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>{item.source}</span>
            <span style={{ background: "#f1f5f9", color: "#64748b", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }}>ID: {item.id}</span>
          </div>
          
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#1e293b", margin: "0 0 12px 0", lineHeight: 1.2 }}>{item.name}</h1>
          
          {/* Geonames 标签 */}
          {geoTags.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
              {geoTags.map((tag, idx) => (
                <span key={idx} style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #d1fae5", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                  {tag.label}: {tag.value}
                </span>
              ))}
            </div>
          )}

          {descriptionText && descriptionText !== "-" && (
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "800px", marginTop: "16px" }}>
              {descriptionText}
            </p>
          )}
        </div>
      </div>

      {/* --- 地图区域 --- */}
      {hasLocation ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "100%", height: "400px", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <iframe
              width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon! - 0.005}%2C${lat! - 0.005}%2C${lon! + 0.005}%2C${lat! + 0.005}&layer=mapnik&marker=${lat}%2C${lon}`}
              style={{ border: 0, width: "100%", height: "100%" }} 
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

      {/* --- 属性表格：全自动动态渲染 --- */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "32px", marginTop: "16px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Metadata Attributes
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", tableLayout: "fixed" }}>
          <tbody>
            {tableRows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px 0", color: "#64748b", fontWeight: 600, width: "160px", verticalAlign: "top" }}>
                  {row.label}
                </td>
                <td style={{ padding: "16px 0", color: "#1e293b", wordWrap: "break-word", lineHeight: 1.6 }}>
                  {row.isLink ? (
                    <a href={row.value} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </td>
              </tr>
            ))}
            {/* 空状态处理：如果所有字段都被过滤掉了 */}
            {tableRows.length === 0 && (
              <tr>
                <td colSpan={2} style={{ padding: "16px 0", color: "#94a3b8", fontStyle: "italic" }}>
                  No additional metadata available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}