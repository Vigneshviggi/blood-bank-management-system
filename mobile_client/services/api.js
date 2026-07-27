import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token and Start performance timer
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Track start time for performance monitoring
  config.metadata = { startTime: new Date() };
  
  return config;
});

// Handle errors globally, calculate performance, and automatic retry
api.interceptors.response.use(
  (response) => {
    // Calculate performance
    const duration = new Date() - response.config.metadata.startTime;
    if (duration > 2000) {
      console.warn(`[Slow API] ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if network is offline
    const networkState = await Network.getNetworkStateAsync();
    
    // If it's a network error and we haven't retried yet
    if ((!networkState.isInternetReachable || error.message === 'Network Error') && !originalRequest._retry) {
      originalRequest._retry = true;
      Toast.show({
        type: 'error',
        text1: 'Network Offline',
        text2: 'Will retry when connection returns.',
      });
      
      // Simple exponential backoff retry (e.g. wait 5 seconds then retry once)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, 5000);
      });
    }

    if (error.response && error.response.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
