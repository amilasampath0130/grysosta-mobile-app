import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Set item with automatic JSON stringification
  set: async (key: string, value: any): Promise<void> => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('Storage set error:', error);
      throw new Error(`Failed to save data for key: ${key}`);
    }
  },

  // Get item with automatic JSON parsing
  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error('Storage get error:', error);
      throw new Error(`Failed to retrieve data for key: ${key}`);
    }
  },

  // Remove a specific item
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
      throw new Error(`Failed to remove data for key: ${key}`);
    }
  },

  // Clear all storage (use with caution)
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw new Error('Failed to clear storage');
    }
  },

  // Get multiple items
  // note: AsyncStorage.multiGet returns Promise<readonly (string | null)[][]> or similar;
  // we accept readonly keys and return a mutable array of pairs for convenience
  multiGet: async (keys: readonly string[]): Promise<[string, any][]> => {
    try {
      const values = await AsyncStorage.multiGet(keys);
      // values is typically readonly [string, string | null][]
      return values.map(([key, value]) => {
        if (value === null) return [key, null] as [string, any];
        try {
          return [key, JSON.parse(value)] as [string, any];
        } catch {
          return [key, value] as [string, any];
        }
      });
    } catch (error) {
      console.error('Storage multiGet error:', error);
      throw new Error('Failed to retrieve multiple items');
    }
  },

  // Set multiple items
  // Accept readonly input to match callers that may have readonly arrays
  multiSet: async (keyValuePairs: readonly [string, any][]): Promise<void> => {
    try {
      const stringPairs: [string, string][] = keyValuePairs.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      await AsyncStorage.multiSet(stringPairs);
    } catch (error) {
      console.error('Storage multiSet error:', error);
      throw new Error('Failed to set multiple items');
    }
  },

  // Remove multiple items
  multiRemove: async (keys: readonly string[]): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(keys as string[]); // AsyncStorage accepts string[]; cast is OK here
    } catch (error) {
      console.error('Storage multiRemove error:', error);
      throw new Error('Failed to remove multiple items');
    }
  },

  // Get all keys
  // Accept the readonly return type from AsyncStorage
  getAllKeys: async (): Promise<readonly string[]> => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      throw new Error('Failed to get storage keys');
    }
  },

  // Check if a key exists
  has: async (key: string): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('Storage has error:', error);
      return false;
    }
  },
};

// Convenience methods for auth storage
export const authStorage = {
  setToken: (token: string): Promise<void> => storage.set('auth_token', token),
  getToken: (): Promise<string | null> => storage.get<string>('auth_token'),
  setUser: (user: any): Promise<void> => storage.set('user_data', user),
  getUser: <T = any>(): Promise<T | null> => storage.get<T>('user_data'),
  clearAuth: (): Promise<void> => storage.multiRemove(['auth_token', 'user_data']),
};

export default storage;
