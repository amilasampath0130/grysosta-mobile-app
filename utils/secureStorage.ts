import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SecureStoreModule = typeof import("expo-secure-store");

let secureStoreModule: SecureStoreModule | null = null;
let secureStoreLoaded = false;

const getSecureStore = (): SecureStoreModule | null => {
  if (secureStoreLoaded) {
    return secureStoreModule;
  }

  try {
    // Lazy-load to avoid crashing when the native module is missing.
    secureStoreModule = require("expo-secure-store");
  } catch {
    secureStoreModule = null;
  }

  secureStoreLoaded = true;

  return secureStoreModule;
};

const memoryStore = new Map<string, string>();
const SECURE_STORE_MAX_SAFE_BYTES = 1900;

const shouldUseAsyncStorageFallback = (value: string): boolean => {
  return value.length > SECURE_STORE_MAX_SAFE_BYTES;
};

export const safeSetItem = async (
  key: string,
  value: string,
): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
      return;
    }

    const SecureStore = getSecureStore();

    if (shouldUseAsyncStorageFallback(value)) {
      await AsyncStorage.setItem(key, value);
      if (SecureStore) {
        const isAvailable =
          typeof SecureStore.isAvailableAsync === "function"
            ? await SecureStore.isAvailableAsync()
            : false;

        if (isAvailable) {
          await SecureStore.deleteItemAsync(key);
        }
      }
      memoryStore.delete(key);
      return;
    }

    await AsyncStorage.removeItem(key);

    if (!SecureStore) {
      memoryStore.set(key, value);
      return;
    }

    const isAvailable =
      typeof SecureStore.isAvailableAsync === "function"
        ? await SecureStore.isAvailableAsync()
        : false;

    if (isAvailable) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    memoryStore.set(key, value);
  } catch {
    memoryStore.set(key, value);
  }
};

export const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return typeof localStorage === "undefined"
        ? null
        : localStorage.getItem(key);
    }

    const SecureStore = getSecureStore();
    const asyncValue = await AsyncStorage.getItem(key);

    if (asyncValue !== null) {
      return asyncValue;
    }

    if (!SecureStore) {
      return memoryStore.get(key) ?? null;
    }

    const isAvailable =
      typeof SecureStore.isAvailableAsync === "function"
        ? await SecureStore.isAvailableAsync()
        : false;

    if (isAvailable) {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    return memoryStore.get(key) ?? null;
  }

  return memoryStore.get(key) ?? null;
};

export const safeDeleteItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
      return;
    }

    const SecureStore = getSecureStore();
    await AsyncStorage.removeItem(key);

    if (!SecureStore) {
      memoryStore.delete(key);
      return;
    }

    const isAvailable =
      typeof SecureStore.isAvailableAsync === "function"
        ? await SecureStore.isAvailableAsync()
        : false;

    if (isAvailable) {
      await SecureStore.deleteItemAsync(key);
      return;
    }

    memoryStore.delete(key);
  } catch {
    memoryStore.delete(key);
  }
};

export class SecureStorage {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly USER_KEY = "user_data";

  static async setToken(token: string): Promise<void> {
    try {
      await safeSetItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save token securely:", error);
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await safeGetItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Failed to retrieve token:", error);
      return null;
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    try {
      await safeSetItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save refresh token securely:", error);
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await safeGetItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to retrieve refresh token:", error);
      return null;
    }
  }

  static async setUser(user: any): Promise<void> {
    try {
      await safeSetItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user data securely:", error);
    }
  }

  static async getUser<T = any>(): Promise<T | null> {
    try {
      const user = await safeGetItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
      return null;
    }
  }

  static async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        safeDeleteItem(this.TOKEN_KEY),
        safeDeleteItem(this.REFRESH_TOKEN_KEY),
        safeDeleteItem(this.USER_KEY),
      ]);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }

  static async hasAuthData(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return token !== null;
    } catch (error) {
      return false;
    }
  }
}
