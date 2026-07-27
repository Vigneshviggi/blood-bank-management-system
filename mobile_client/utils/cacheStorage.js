import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Error caching data:", e);
  }
};

export const getCachedData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error retrieving cached data:", e);
    return null;
  }
};

export const removeCachedData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Error removing cached data:", e);
  }
};

export const clearAllCache = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error("Error clearing cache:", e);
  }
};
