import * as SecureStore from 'expo-secure-store';

export class SecureStorage {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user_data';

  static async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save token securely:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save refresh token securely:', error);
      throw new Error('Failed to save refresh token');
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  static async setUser(user: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data securely:', error);
      throw new Error('Failed to save user data');
    }
  }

  static async getUser<T = any>(): Promise<T | null> {
    try {
      const user = await SecureStore.getItemAsync(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  static async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(this.TOKEN_KEY),
        SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(this.USER_KEY),
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw new Error('Failed to clear authentication data');
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