import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';


// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://3.106.59.219:5000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
// Request interceptor to add auth token - Simple approach like admin
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const userType = localStorage.getItem('userType');
    
    // Use appropriate token based on user type
    const currentToken = userType === 'admin' ? adminToken : token;
    
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for basic error handling - Simple approach like admin
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle 401 errors - redirect to login
    if (error.response?.status === 401) {
      console.error('Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      
      // Dispatch auth-failed event for React to handle
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth-failed'));
      }, 100);
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Access forbidden: Insufficient permissions');
    }

    return Promise.reject(error);
  }
);

export default api;
