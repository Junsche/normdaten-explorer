// src/api/client.ts
import type { NormData } from '../types/normdata';

const BASE_URL = "/api-os"; 

export async function searchNormdata(
  query: string, 
  types: string[], 
  sources: string[],
  pageSize: number = 20, 
  page: number = 1,
  maxLimit: number = 100 
): Promise<{ total: number; hits: NormData[] }> {
  
  let targetIndex = "mi-proj-*";
  if (sources.length > 0) {
    targetIndex = sources.map(s => `mi-proj-${s.toLowerCase() === 'geoname' ? 'geonames' : s.toLowerCase()}*`).join(',');
  }

  const from = (page - 1) * pageSize; // 确认无 $ 符号

  try {
    const response = await fetch(`${BASE_URL}/${targetIndex}/_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        size: pageSize, 
        query: {
          bool: {
            must: [
              query.trim() === "" ? { match_all: {} } : {
                query_string: { 
                  query: `*${query}*`,
                  fields: ["name", "name.value", "label", "description", "description.value", "identifier"],
                  default_operator: "AND"
                }
              }
            ],
            filter: types.length > 0 ? [{ terms: { "type.keyword": types } }] : []
          }
        },
        sort: [{ "_score": "desc" }]
      })
    });

    if (!response.ok) return { total: 0, hits: [] };
    const data = await response.json();
    const actualTotal = data.hits?.total?.value || 0;
    const cappedTotal = Math.min(actualTotal, maxLimit);

    const superExtract = (val: any): string => {
      if (!val || val === "-") return "";
      if (typeof val === 'string' || typeof val === 'number') return String(val).trim();
      if (Array.isArray(val)) return superExtract(val[0]);
      if (typeof val === 'object' && val.value) return superExtract(val.value);
      return "";
    };

    const hits = (data.hits?.hits || []).map((hit: any) => {
      const s = hit._source;
      const idx = hit._index.toLowerCase();
      
      return {
        ...s, 
        id: s.identifier || hit._id,
        name: superExtract(s.name) || superExtract(s.label) || "No Title", 
        source: idx.includes("geonames") ? "geonames" : (idx.split('-')[2] || "unknown"),
        type: s.type || "Entity", 
        description: superExtract(s.description),
      };
    });

    return { total: cappedTotal, hits };
  } catch (error) {
    return { total: 0, hits: [] };
  }
}