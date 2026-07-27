import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const CACHE_PREFIX = '@LifeLinkCache:';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

/**
 * Fetches data from API, falls back to cache if offline
 * @param {string} endpoint - API endpoint
 * @param {string} cacheKey - Unique key for cache
 */
export const fetchWithCache = async (endpoint, cacheKey) => {
  const fullKey = `${CACHE_PREFIX}${cacheKey}`;
  
  try {
    // Try network first
    const response = await api.get(endpoint);
    
    // Save to cache
    const cacheData = {
      data: response.data,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(fullKey, JSON.stringify(cacheData));
    
    return response.data;
  } catch (error) {
    console.log(`Network request failed for ${endpoint}, checking cache...`);
    
    // If network fails, try cache
    const cachedItem = await AsyncStorage.getItem(fullKey);
    if (cachedItem) {
      const parsedCache = JSON.parse(cachedItem);
      // Optional: Check expiry
      if (Date.now() - parsedCache.timestamp < CACHE_EXPIRY) {
        console.log(`Serving ${cacheKey} from cache`);
        return parsedCache.data;
      } else {
        console.log(`Cache for ${cacheKey} expired`);
      }
    }
    
    throw error; // If no cache or expired, throw original error
  }
};

/**
 * Clears all cached data
 */
export const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
