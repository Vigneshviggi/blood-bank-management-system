import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://blood-bank-management-system-a2vx.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map(); // event -> Set of callbacks
    this.connectPromise = null;
  }

  async connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token ? `Bearer ${token}` : ''
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        // Re-attach all registered event listeners
        this.listeners.forEach((callbacks, event) => {
          callbacks.forEach((cb) => {
            this.socket.on(event, cb);
          });
        });
      });

      this.socket.on('disconnect', () => {});

      this.socket.on('connect_error', (err) => {
        console.warn('Socket connection warning:', err.message);
      });

      return this.socket;
    } catch (err) {
      console.warn('Socket connect error:', err.message);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      // Auto connect if not already connected
      this.connect();
    }
  }

  off(event, callback) {
    if (callback) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
        if (this.listeners.get(event).size === 0) {
          this.listeners.delete(event);
        }
      }
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      this.connect().then((sock) => {
        if (sock) sock.emit(event, data);
      });
    }
  }
}

const socketService = new SocketService();
export default socketService;


