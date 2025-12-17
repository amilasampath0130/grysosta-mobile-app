export interface User {
  id: string;
  name: string;
  userName: string;
  email: string;
  mobileNumber?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  userName: string;
  email: string;
  password: string;
  mobileNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message: string;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}