export const AUTH_CONSTANTS = {
  // API Endpoints
  ENDPOINTS: {
    // LOGIN: '/(auth)/login',
    // SIGNUP: '/auth/signup',
    // LOGOUT: '/auth/logout',
    // FORGOT_PASSWORD: '/auth/forgot-password',
    // RESET_PASSWORD: '/auth/reset-password',
    // VERIFY_EMAIL: '/auth/verify-email',
    // PROFILE: '/auth/profile',
  } as const,

  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER: 'user_data',
    THEME: 'app_theme',
    LANGUAGE: 'app_language',
  } as const,

  // Validation Messages
  VALIDATION: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
    PASSWORD_MAX_LENGTH: 'Password must be less than 50 characters',
    NAME_REQUIRED: 'Name is required',
    NAME_MIN_LENGTH: 'Name must be at least 2 characters',
    NAME_MAX_LENGTH: 'Name must be less than 50 characters',
    USERNAME_REQUIRED: 'Username is required',
    USERNAME_MIN_LENGTH: 'Username must be at least 3 characters',
    USERNAME_MAX_LENGTH: 'Username must be less than 30 characters',
    USERNAME_PATTERN: 'Username can only contain letters, numbers, and underscores',
    MOBILE_INVALID: 'Please enter a valid mobile number',
  } as const,

  // API Configuration
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000, // 10 seconds

  // App Constants
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
} as const;