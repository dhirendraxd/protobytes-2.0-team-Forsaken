import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    throw error;
  }
);

// API Service Methods
export const apiService = {
  // Market Prices
  getMarketPrices: (params?: { category?: string; limit?: number; location?: string }) =>
    apiClient.get('/market-prices', { params }),
  
  getMarketPriceById: (id: string) =>
    apiClient.get(`/market-prices/${id}`),
  
  addMarketPrice: (data: any) =>
    apiClient.post('/market-prices', data),
  
  updateMarketPrice: (id: string, data: any) =>
    apiClient.put(`/market-prices/${id}`, data),
  
  // Transport
  getTransportSchedules: (params?: { route?: string; limit?: number }) =>
    apiClient.get('/transport', { params }),
  
  getTransportScheduleById: (id: string) =>
    apiClient.get(`/transport/${id}`),
  
  addTransportSchedule: (data: any) =>
    apiClient.post('/transport', data),
  
  updateTransportSchedule: (id: string, data: any) =>
    apiClient.put(`/transport/${id}`, data),
  
  // Alerts
  getAlerts: (params?: { category?: string; limit?: number }) =>
    apiClient.get('/alerts', { params }),
  
  getAlertById: (id: string) =>
    apiClient.get(`/alerts/${id}`),
  
  addAlert: (data: any) =>
    apiClient.post('/alerts', data),
  
  updateAlert: (id: string, data: any) =>
    apiClient.put(`/alerts/${id}`, data),
  
  // Authentication
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  signup: (data: any) =>
    apiClient.post('/auth/signup', data),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  // Contributors
  getContributors: () =>
    apiClient.get('/contributors'),
  
  addContributor: (data: any) =>
    apiClient.post('/contributors', data),
  
  // Health Check
  healthCheck: () =>
    apiClient.get('/health'),
};

export default apiClient;
