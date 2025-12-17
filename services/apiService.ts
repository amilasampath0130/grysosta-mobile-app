import { TokenStorage } from '@/utils/tokenStorage';

// Update this to match your actual backend URL
// Make sure your backend server is running on this address
const API_URL = 'http://192.168.8.101:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await TokenStorage.getToken();
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log(`Making API request to: ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        // More detailed error information
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // More specific error handling with proper typing
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Cannot connect to server. Please check your internet connection and ensure the backend is running.');
        }
        throw error;
      }
      
      // Handle non-Error objects
      throw new Error('An unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = new ApiService();