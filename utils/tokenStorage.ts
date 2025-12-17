// Simple in-memory token storage
let authToken: string | null = null;

export const TokenStorage = {
  setToken: (token: string) => {
    authToken = token;
    console.log('✅ Token stored successfully');
  },
  
  getToken: (): string | null => {
    return authToken;
  },
  
  clearToken: () => {
    authToken = null;
    console.log('✅ Token cleared');
  }
};