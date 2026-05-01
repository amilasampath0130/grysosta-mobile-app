import { SecureStorage } from '@/utils/secureStorage';
import { API_CONFIG } from '@/config/config';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

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
  private fallbackBaseURL: string | null;
  private timeout: number;
  private maxRetries: number;

  constructor() {
    this.baseURL = getApiBaseUrl().replace(/\/$/, '');
    this.fallbackBaseURL = null;

    const envTimeout = Number(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS);
    this.timeout = Number.isFinite(envTimeout) && envTimeout > 0
      ? envTimeout
      : API_CONFIG.REQUEST_TIMEOUT_MS || 20000;

    this.maxRetries = 1;
  }

  private async executeRequest(
    baseURL: string,
    endpoint: string,
    options: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(`${baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await SecureStorage.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const candidateBaseUrls = [
      this.baseURL,
      ...(this.fallbackBaseURL ? [this.fallbackBaseURL] : []),
    ];

    const attemptedUrls: string[] = [];

    for (const currentBaseURL of candidateBaseUrls) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
        try {
          const response = await this.executeRequest(currentBaseURL, endpoint, config);

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

          if (response.status === 401) {
            await SecureStorage.clearAuth();
          }

          throw error;
        }

        return data;
      } catch (error) {
          const isAbort = isErrorWithName(error) && error.name === 'AbortError';
          const errorMessage = isApiError(error)
            ? error.message
            : isError(error)
              ? error.message
              : 'An unknown error occurred';
          const isNetworkFailure =
            typeof errorMessage === 'string' &&
            (/network request failed/i.test(errorMessage) ||
              /failed to fetch/i.test(errorMessage));

          const canRetry = attempt < this.maxRetries && (isAbort || isNetworkFailure);

          if (canRetry) {
            continue;
          }

          if (isAbort || isNetworkFailure) {
            attemptedUrls.push(`${currentBaseURL}${endpoint}`);
            break;
          }

          console.error('API request failed:', error);

          if (isApiError(error)) {
            throw error;
          }

          if (isError(error)) {
            throw { message: error.message } as ApiError;
          }

          throw { message: 'An unknown error occurred' } as ApiError;
        }
      }
    }

    throw {
      message: `Cannot reach API after timeout/network retries. Tried: ${attemptedUrls.join(' , ')}. Check EXPO_PUBLIC_API_URL and ensure backend is reachable from your device.`,
    } as ApiError;
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