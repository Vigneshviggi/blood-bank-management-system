import { Platform } from 'react-native';

export const API_BASE_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api')
  : 'https://blood-bank-management-system-a2vx.onrender.com/api';

export default API_BASE_URL;
