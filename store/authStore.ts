import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage } from '@/utils/secureStorage';
import { apiService } from '@/services/api';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  mobileNumber: string;
  profileImage: string;
  lastLogin: string;
  createdAt: string;
  isVerified: boolean;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Existing methods
  login: (login: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>; // Fixed: returns Promise<void>
  updateUser: (userData: Partial<User>) => void;
  // NEW: Email verification methods
  sendVerificationCode: (userData: RegisterData) => Promise<{ success: boolean; email: string }>;
  verifyAndRegister: (email: string, code: string) => Promise<{ success: boolean }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean }>;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  mobileNumber: string;
}

// Define proper API response types
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
  };
}

// NEW: Verification response types
interface SendVerificationResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiresIn: string;
  };
}

interface VerifyAndRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

interface ResendVerificationResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiresIn: string;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ✅ Existing login method
      login: async (login: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.post<LoginResponse>('/auth/login', { login, password });

          if (response.success && response.data) {
            // Store tokens securely
            await SecureStorage.setToken(response.data.token);
            await SecureStorage.setRefreshToken(response.data.refreshToken);
            await SecureStorage.setUser(response.data.user);

            set({
              user: response.data.user,
              token: response.data.token,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // ✅ OLD register method (keep for backward compatibility)
      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.post<RegisterResponse>('/auth/register', userData);

          if (response.success && response.data) {
            // Store tokens securely
            await SecureStorage.setToken(response.data.token);
            await SecureStorage.setRefreshToken(response.data.refreshToken);
            await SecureStorage.setUser(response.data.user);

            set({
              user: response.data.user,
              token: response.data.token,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // ✅ NEW: Send verification code
      sendVerificationCode: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.post<SendVerificationResponse>('/auth/send-verification', userData);

          if (response.success) {
            set({ isLoading: false, error: null });
            return { 
              success: true, 
              email: response.data?.email || userData.email 
            };
          } else {
            throw new Error(response.message || 'Failed to send verification code');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // ✅ NEW: Verify code and complete registration
      verifyAndRegister: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.post<VerifyAndRegisterResponse>('/auth/verify-and-register', { 
            email, 
            code 
          });

          if (response.success && response.data) {
            // Store tokens securely
            await SecureStorage.setToken(response.data.token);
            await SecureStorage.setRefreshToken(response.data.refreshToken);
            await SecureStorage.setUser(response.data.user);

            set({
              user: response.data.user,
              token: response.data.token,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return { success: true };
          } else {
            throw new Error(response.message || 'Verification failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Verification failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // ✅ NEW: Resend verification code
      resendVerificationCode: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.post<ResendVerificationResponse>('/auth/resend-verification', { 
            email 
          });

          if (response.success) {
            set({ isLoading: false, error: null });
            return { success: true };
          } else {
            throw new Error(response.message || 'Failed to resend verification code');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification code';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // ✅ FIXED: refreshAuth method - returns Promise<void>
      refreshAuth: async (): Promise<void> => {
        try {
          const response = await apiService.post<RefreshTokenResponse>('/auth/refresh-token');
          
          if (response.success && response.data) {
            const { token, refreshToken } = response.data;
            
            // Store new tokens securely
            await SecureStorage.setToken(token);
            await SecureStorage.setRefreshToken(refreshToken);
            
            set({
              token,
              refreshToken,
            });

            // Don't return anything - just void
            return;
          } else {
            throw new Error(response.message || 'Token refresh failed');
          }
        } catch (error) {
          await get().logout();
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint
          await apiService.post('/auth/logout');
        } catch (error) {
          console.error('Logout API call failed:', error);
        } finally {
          // Always clear local storage
          await SecureStorage.clearAuth();
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        }
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
        
        // Update secure storage
        const { user } = get();
        if (user) {
          SecureStorage.setUser(user);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return async (state) => {
          if (state) {
            // Rehydrate tokens from secure storage
            const [token, refreshToken, user] = await Promise.all([
              SecureStorage.getToken(),
              SecureStorage.getRefreshToken(),
              SecureStorage.getUser<User>(),
            ]);

            if (token && user) {
              state.token = token;
              state.refreshToken = refreshToken;
              state.user = user;
              state.isAuthenticated = true;
            }
          }
        };
      },
    }
  )
);