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
    // Try multiple possible paths
    const paths = [
      '/Pincode Serviceability.csv',
      './Pincode Serviceability.csv',
      '/public/Pincode Serviceability.csv'
    ];
    
    let response: Response | null = null;
    let text = '';
    
    for (const path of paths) {
      try {
        response = await fetch(path);
        if (response.ok) {
          text = await response.text();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!text) {
      console.error('Could not load CSV file from any path. Please ensure "Pincode Serviceability.csv" is in the public folder.');
      return [];
    }
    
    if (text.length < 100) {
      console.error('CSV file appears to be empty or too small');
      return [];
    }
    
    const lines = text.split('\n').filter(line => line.trim());
    serviceLocations = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing - split by comma
      const columns = line.split(',').map(col => col.trim());
      
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
    
    console.log(`Loaded ${serviceLocations.length} service locations from CSV`);
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

