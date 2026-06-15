
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://blood-bank-management-system-a2vx.onrender.com';
let socket;

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem('token');
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('reconnect_attempt', () => {
    console.log('Socket reconnecting...');
  });

  // Add event listeners for notifications, requests, camps, etc.
  // Example:
  // socket.on('notification', (data) => { ... });
  // socket.on('request_update', (data) => { ... });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
