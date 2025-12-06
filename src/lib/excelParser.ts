import * as XLSX from 'xlsx';

export interface HSNItem {
  hsnCode: string;
  description: string;
}

let hsnData: HSNItem[] = [];

export const loadHSNData = async (): Promise<HSNItem[]> => {
  if (hsnData.length > 0) {
    return hsnData;
  }

  try {
    const response = await fetch('/ITEM LIST.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    // Parse the data (assuming first row is header)
    hsnData = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length >= 2) {
        hsnData.push({
          hsnCode: String(row[0] || '').trim(),
          description: String(row[1] || '').trim(),
        });
      }
    }
    
    return hsnData;
  } catch (error) {
    console.error('Error loading HSN data:', error);
    // Return some default data if file can't be loaded
    return [
      { hsnCode: '62072190', description: 'MENS WEAR DOTHI MADE OF 100% COTTON' },
      { hsnCode: '62052000', description: 'MENS WEAR TSHIRT MADE OF 100% COTTON' },
      { hsnCode: '74181021', description: 'BRASS POOJA KUNDULU' },
      { hsnCode: '42033000', description: 'MENS WEAR HIP BELT' },
      { hsnCode: '49011010', description: 'READING BOOKS' },
    ];
  }
};

export const searchHSN = async (query: string): Promise<HSNItem[]> => {
  const data = await loadHSNData();
  if (!query) return data.slice(0, 50); // Return first 50 if no query
  
  const lowerQuery = query.toLowerCase();
  return data.filter(item => 
    item.hsnCode.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 50);
};

export const getHSNByCode = async (code: string): Promise<HSNItem | null> => {
  const data = await loadHSNData();
  return data.find(item => item.hsnCode === code) || null;
};

