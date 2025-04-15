import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  APP_SETTINGS: '@app_settings',
} as const;

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  },
}; 