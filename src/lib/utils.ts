import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors and retry logic
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Check if we should retry
    const shouldRetry = 
      config.__retryCount < 3 && // Max 3 retries
      (
        error.code === 'ECONNRESET' || 
        error.code === 'ECONNABORTED' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('Network Error')
      );
    
    if (shouldRetry) {
      config.__retryCount += 1;
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, config.__retryCount - 1) * 1000;
      
      console.log(`Retrying request (attempt ${config.__retryCount}/3) after ${delayMs}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      return axiosInstance(config);
    }
    
    // Handle 401 - unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Re-export axios utilities to avoid importing axios separately
export const isAxiosError = axios.isAxiosError;
export type { AxiosError };

export default axiosInstance;