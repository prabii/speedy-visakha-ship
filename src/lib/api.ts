// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; accountNo?: string; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.accountNo) queryParams.append('accountNo', params.accountNo);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
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
    create: (data: any) => api.fetch('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/invoices/${id}`, { method: 'DELETE' }),
  },
  
  // AWB API
  awb: {
    getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; accountNo?: string; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.accountNo) queryParams.append('accountNo', params.accountNo);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
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
    create: (data: any) => api.fetch('/awb', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/awb/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateTracking: (id: string, data: any) => api.fetch(`/awb/${id}/tracking`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/awb/${id}`, { method: 'DELETE' }),
  },
};

export default api;
