export interface ServiceLocation {
  pincode: string;
  stateCode: string;
  district: string;
  prepaid: string;
  reversePickup: string;
  repl: string;
  cod: string;
  cash: string;
}

let serviceLocations: ServiceLocation[] = [];

export const loadServiceLocations = async (): Promise<ServiceLocation[]> => {
  if (serviceLocations.length > 0) {
    return serviceLocations;
  }

  try {
    const response = await fetch('/Pincode Serviceability.csv');
    const text = await response.text();
    
    const lines = text.split('\n').filter(line => line.trim());
    serviceLocations = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle CSV parsing - split by comma but handle quoted fields
      const columns: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          columns.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      columns.push(current.trim()); // Add last column
      
      if (columns.length >= 8) {
        serviceLocations.push({
          pincode: columns[0] || '',
          stateCode: columns[1] || '',
          district: columns[2] || '',
          prepaid: columns[3] || '',
          reversePickup: columns[4] || '',
          repl: columns[5] || '',
          cod: columns[6] || '',
          cash: columns[7] || '',
        });
      }
    }
    
    return serviceLocations;
  } catch (error) {
    console.error('Error loading service locations:', error);
    return [];
  }
};

export const searchServiceLocations = async (
  query: string,
  stateCode?: string
): Promise<ServiceLocation[]> => {
  const data = await loadServiceLocations();
  
  let filtered = data;
  
  if (stateCode) {
    filtered = filtered.filter(item => item.stateCode === stateCode);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(item =>
      item.pincode.toLowerCase().includes(lowerQuery) ||
      item.district.toLowerCase().includes(lowerQuery)
    );
  }
  
  return filtered.slice(0, 100); // Limit to 100 results
};

