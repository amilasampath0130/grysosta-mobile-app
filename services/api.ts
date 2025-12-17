import { SecureStorage } from '@/utils/secureStorage';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Type guard to check if error is an ApiError
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

// Type guard to check if error is an Error object
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Type guard to check if error has a name property
function isErrorWithName(error: unknown): error is { name: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as { name: string }).name === 'string'
  );
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
    this.timeout = 10000; // 10 seconds
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = await SecureStorage.getToken();
      
      const config: RequestInit = {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || 'Request failed',
          status: response.status,
          code: data.code,
        };

        // Auto-logout on unauthorized
        if (response.status === 401) {
          await SecureStorage.clearAuth();
          // You might want to trigger a global logout here
        }

        throw error;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Properly handle the unknown error type
      if (isErrorWithName(error) && error.name === 'AbortError') {
        throw { message: 'Request timeout' } as ApiError;
      }
      
      console.error('API request failed:', error);
      
      // Re-throw with proper typing
      if (isApiError(error)) {
        throw error;
      } else if (isError(error)) {
        throw { message: error.message } as ApiError;
      } else {
        throw { message: 'An unknown error occurred' } as ApiError;
      }
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

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Token refresh mechanism
  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    const refreshToken = await SecureStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.post<{
      success: boolean;
      message: string;
      data: { token: string; refreshToken: string };
    }>('/auth/refresh-token', { refreshToken });

    if (response.success && response.data) {
      await SecureStorage.setToken(response.data.token);
      await SecureStorage.setRefreshToken(response.data.refreshToken);
      return response.data;
    }

    throw new Error(response.message || 'Failed to refresh token');
  }
}

export const apiService = new ApiService();