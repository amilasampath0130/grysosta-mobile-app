const DEFAULT_BACKEND_ORIGIN = "https://grysosta-backend.onrender.com";

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const derivedOrigin = envApiUrl
  ? envApiUrl.replace(/\/api\/?$/i, "")
  : DEFAULT_BACKEND_ORIGIN;

export const API_CONFIG = {
  BASE_URL: derivedOrigin,
  REQUEST_TIMEOUT_MS: 20000,
  TOKEN_KEY: "user_token",
};
