import { logger } from "@/lib/logger";

// Simple in-memory token storage
let authToken: string | null = null;

export const TokenStorage = {
  setToken: (token: string) => {
    authToken = token;
    logger.info("Token stored in memory");
  },
  
  getToken: (): string | null => {
    return authToken;
  },
  
  clearToken: () => {
    authToken = null;
    logger.info("In-memory token cleared");
  }
};