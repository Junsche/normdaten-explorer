// src/App.tsx
import { ExplorerPage } from "./pages/ExplorerPage";

function App() {
  // 确保这里没有 className="container" 或 style={{ maxWidth: ... }}
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ExplorerPage />
    </div>
  );
}

export default App;