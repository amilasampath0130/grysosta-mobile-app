export const Constants = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://grysosta-backend.onrender.com/api',
  STORAGE_KEYS: {
    AUTH_STORAGE: 'auth-storage',
    PROFILE_MOONSHOT_PROMPT_PENDING: 'profile_moonshot_prompt_pending',
  },
  EXTERNAL_URLS: {
    MOONSHOT: 'https://moonshot.money/',
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    NAME_MIN_LENGTH: 2,
  }
};