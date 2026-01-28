// src/types/normdata.ts
export interface NormData {
  id: string;
  name: string;
  type: string;
  source: string;
  description?: string | any;
  
  // 核心字段
  latitude?: number | string | string[];
  longitude?: number | string | string[];
  address?: string | object;

  // 链接相关
  url?: string;
  mainEntityOfPage?: string;
  sameAs?: string[]; 

  // 丰富信息字段 (对应 OpenSearch 左侧列表)
  alternateName?: string | string[];
  foundingDate?: string | string[]; 
  deathDate?: string | string[];    
  gender?: string | string[];       
  logo?: string | string[];         
  award?: string | string[];        
  founder?: string | string[];      
  areaServed?: string | string[];   
  subOrganization?: string | string[];
  affiliation?: string | string[]; // 关联机构

  // 允许其他未定义字段
  [key: string]: any;
}