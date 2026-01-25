// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vz-ztf8.onrender.com/api';

export const api = {
  baseURL: API_BASE_URL,
  
  // Helper function to make API calls
  async fetch(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        // Try to get error message from response body
        let errorMessage = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error: any) {
      // Handle connection errors gracefully
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Backend server is not running. Please start the backend server on port 5000.');
      }
      throw error;
    }
  },
  
  // Customers API
  customers: {
    getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      return api.fetch(`/customers?${queryParams}`);
    },
    getById: (id: string) => api.fetch(`/customers/${id}`),
    getByAccountNo: (accountNo: string) => api.fetch(`/customers/account/${accountNo}`),
    create: (data: any) => api.fetch('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/customers/${id}`, { method: 'DELETE' }),
  },
  
  // Invoices API
  invoices: {
    getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; accountNo?: string; startDate?: string; endDate?: string; vendorId?: string; userRole?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.accountNo) queryParams.append('accountNo', params.accountNo);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
      if (params?.userRole) queryParams.append('userRole', params.userRole);
      return api.fetch(`/invoices?${queryParams}`);
    },
    getStats: (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      return api.fetch(`/invoices/stats?${queryParams}`);
    },
    getById: (id: string) => api.fetch(`/invoices/${id}`),
    getByInvoiceNo: (invoiceNo: string) => api.fetch(`/invoices/number/${invoiceNo}`),
    getByCustomer: (customerId: string) => api.fetch(`/invoices/customer/${customerId}`),
    getByAccount: (accountNo: string) => api.fetch(`/invoices/account/${accountNo}`),
    create: (data: any, vendorId?: string) => {
      const payload = vendorId ? { ...data, vendorId } : data;
      return api.fetch('/invoices', { method: 'POST', body: JSON.stringify(payload) });
    },
    update: (id: string, data: any) => api.fetch(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/invoices/${id}`, { method: 'DELETE' }),
  },
  
  // AWB API
  awb: {
    getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; accountNo?: string; startDate?: string; endDate?: string; vendorId?: string; userRole?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.accountNo) queryParams.append('accountNo', params.accountNo);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
      if (params?.userRole) queryParams.append('userRole', params.userRole);
      return api.fetch(`/awb?${queryParams}`);
    },
    getStats: (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      return api.fetch(`/awb/stats?${queryParams}`);
    },
    track: (awbNo: string) => api.fetch(`/awb/track/${awbNo}`),
    getById: (id: string) => api.fetch(`/awb/${id}`),
    getByAWBNo: (awbNo: string) => api.fetch(`/awb/number/${awbNo}`),
    getByCustomer: (customerId: string) => api.fetch(`/awb/customer/${customerId}`),
    getByAccount: (accountNo: string) => api.fetch(`/awb/account/${accountNo}`),
    create: (data: any, vendorId?: string) => {
      const payload = vendorId ? { ...data, vendorId } : data;
      return api.fetch('/awb', { method: 'POST', body: JSON.stringify(payload) });
    },
    update: (id: string, data: any) => api.fetch(`/awb/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateBookingDate: (id: string, bookingDate: string, userRole: string) => api.fetch(`/awb/${id}/booking-date`, { method: 'PUT', body: JSON.stringify({ bookingDate, userRole }) }),
    updateBookingDateByAWBNo: (awbNo: string, bookingDate: string, userRole: string) => api.fetch(`/awb/number/${awbNo}/booking-date`, { method: 'PUT', body: JSON.stringify({ bookingDate, userRole }) }),
    updateTracking: (id: string, data: any) => api.fetch(`/awb/${id}/tracking`, { method: 'PUT', body: JSON.stringify(data) }),
    updateTrackingByAWBNo: (awbNo: string, data: any) => api.fetch(`/awb/number/${awbNo}/tracking`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/awb/${id}`, { method: 'DELETE' }),
  },
  
  // Branch Locations API
  branchLocations: {
    getAll: (params?: { isActive?: boolean }) => {
      const queryParams = new URLSearchParams();
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      const query = queryParams.toString();
      return api.fetch(`/branch-locations${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => api.fetch(`/branch-locations/${id}`),
    create: (data: any) => api.fetch('/branch-locations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/branch-locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/branch-locations/${id}`, { method: 'DELETE' }),
  },
  
  // Users API
  users: {
    login: (data: { username: string; password: string }) => api.fetch('/users/login', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => api.fetch('/users'),
    getById: (id: string) => api.fetch(`/users/${id}`),
    create: (data: any) => api.fetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/users/${id}`, { method: 'DELETE' }),
    changePassword: (data: { userId: string; oldPassword: string; newPassword: string }) => api.fetch('/users/change-password', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  // Price Sheets API
  priceSheets: {
    getAll: (params?: { isActive?: boolean; isDefault?: boolean }) => {
      const queryParams = new URLSearchParams();
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.isDefault !== undefined) queryParams.append('isDefault', params.isDefault.toString());
      const query = queryParams.toString();
      return api.fetch(`/price-sheets${query ? `?${query}` : ''}`);
    },
    getActive: () => api.fetch('/price-sheets/active'),
    getById: (id: string) => api.fetch(`/price-sheets/${id}`),
    upload: (formData: FormData) => {
      return fetch(`${API_BASE_URL}/price-sheets/upload`, {
        method: 'POST',
        body: formData,
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `${response.status} ${response.statusText}` }));
          throw new Error(errorData.message || `${response.status} ${response.statusText}`);
        }
        return response.json();
      });
    },
    update: (id: string, data: any) => api.fetch(`/price-sheets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateItem: (id: string, itemId: string, data: any) => api.fetch(`/price-sheets/${id}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteItem: (id: string, itemId: string) => api.fetch(`/price-sheets/${id}/items/${itemId}`, { method: 'DELETE' }),
    delete: (id: string) => api.fetch(`/price-sheets/${id}`, { method: 'DELETE' }),
  },
};

export default api;
