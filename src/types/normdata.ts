// src/types/normdata.ts
export interface NormData {
  id: string;
  name: string;
  source: string;
  type: string;
  description?: string;
  // 允许任何额外的 API 原始字段，以便 DetailPanel 自动渲染
  [key: string]: any; 
}