// src/components/SearchBar.tsx
interface Props {
  query: string;
  onChange: (val: string) => void; // 必须是这种类型的函数
}

export function SearchBar({ query, onChange }: Props) {
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search Term..."
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #dcdfe6",
        fontSize: "14px",
        height: "42px",
        background: "#fcfdfe",
        color: "#606266",
        boxSizing: "border-box",
        outline: "none"
      }}
    />
  );
}