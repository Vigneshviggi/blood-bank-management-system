import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token and Start performance timer
api.interceptors.request.use(async (config) => {
  console.log("BASE URL:", config.baseURL);
  console.log("REQUEST URL:", config.url);

  if (config.url && !/^https?:\/\//i.test(config.url)) {
    config.url = config.url.replace(/^\/+/, '');
    config.url = config.url.replace(/^api\//, '');
  }

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
    if ((!networkState.isInternetReachable || error.message === 'Network Error' || error.code === 'ECONNABORTED') && !originalRequest._retry) {
      originalRequest._retry = true;
      Toast.show({
        type: 'error',
        text1: 'Network Offline',
        text2: 'Retrying automatically when connection returns.',
      });

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          api(originalRequest).then(resolve).catch(reject);
        }, 8000);
      });
    }

    const duration = originalRequest?.metadata ? new Date() - originalRequest.metadata.startTime : 0;
    const requestPayload = originalRequest?.data ? originalRequest.data : null;
    const responsePayload = error.response?.data || null;

    console.error('[API Error]', {
      endpoint: originalRequest?.url,
      method: originalRequest?.method,
      statusCode: error.response?.status,
      message: error.message,
      requestPayload,
      responsePayload,
      duration,
    });

    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
