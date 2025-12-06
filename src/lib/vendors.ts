// Vendor data
export interface Vendor {
  name: string;
  code: string;
}

export const vendors: Vendor[] = [
  { name: 'UNITED PARCEL SERVICE', code: 'UPS' },
  { name: 'NX-DHL', code: 'NDHL' },
  { name: 'ICL', code: 'ICL' },
  { name: 'FEDEX PROMO', code: 'FXP' },
  { name: 'FEDERAL EXPRESS CORPORATION', code: 'FDX' },
];

// Service data (linked to vendors)
export interface Service {
  name: string;
  vendorCode: string;
}

export const services: Service[] = [
  { name: 'WORLDWIDE EXPRESS SAVER', vendorCode: 'UPS' },
  { name: 'WORLDWIDE EXPRESS', vendorCode: 'NDHL' },
  { name: 'PRIORITY FREIGHT', vendorCode: 'FDX' },
  { name: 'Economy', vendorCode: 'ICL' },
  { name: 'INTL PREMIUM EXPRESS', vendorCode: 'FDX' },
  { name: 'INTERNATIONAL PRIORITY', vendorCode: 'FDX' },
  { name: 'INTERNATIONAL PRIORITY', vendorCode: 'FXP' },
  { name: 'EXPRESS', vendorCode: 'ICL' },
  { name: 'ECONOMY FREIGHT', vendorCode: 'FDX' },
  { name: 'ECONOMY', vendorCode: 'FDX' },
];

// Product data
export interface Product {
  name: string;
  code: string;
}

export const products: Product[] = [
  { name: 'UPS PACK', code: 'UPK' },
  { name: 'DHL EXPRESS', code: 'DHL' },
  { name: 'FEDEX EXPRESS', code: 'FEX' },
  { name: 'ICL EXPRESS', code: 'ICL' },
];

export const searchVendors = (query: string): Vendor[] => {
  if (!query) return vendors;
  const lowerQuery = query.toLowerCase();
  return vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(lowerQuery) ||
    vendor.code.toLowerCase().includes(lowerQuery)
  );
};

export const searchServices = (query: string, vendorCode?: string): Service[] => {
  let filtered = services;
  if (vendorCode) {
    filtered = filtered.filter(service => service.vendorCode === vendorCode);
  }
  if (!query) return filtered;
  const lowerQuery = query.toLowerCase();
  return filtered.filter(service => 
    service.name.toLowerCase().includes(lowerQuery) ||
    service.vendorCode.toLowerCase().includes(lowerQuery)
  );
};

export const searchProducts = (query: string): Product[] => {
  if (!query) return products;
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.code.toLowerCase().includes(lowerQuery)
  );
};

