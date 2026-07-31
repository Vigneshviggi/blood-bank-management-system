import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const base64UrlDecode = (input) => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  if (typeof atob === 'function') {
    return atob(padded);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('binary');
  }

  throw new Error('Base64 decoding not supported in this environment.');
};

const jwtDecode = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const decodedPayload = base64UrlDecode(parts[1]);
  const payload = decodeURIComponent(
    decodedPayload
      .split('')
      .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );

  return JSON.parse(payload);
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        // Optional: Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          await logout();
        } else {
          const profileResponse = await api.get('/users/profile');
          const profile = profileResponse.data?.user;
          const currentUser = profile || decoded;
          setUser(currentUser);
          setRole(currentUser?.role || decoded.role);
          await AsyncStorage.setItem('user', JSON.stringify(currentUser));
        }
      }
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (token, profile = null) => {
    try {
      await AsyncStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      const currentUser = profile || decoded;
      setUser(currentUser);
      setRole(currentUser?.role || decoded.role);
      await AsyncStorage.setItem('user', JSON.stringify(currentUser));
    } catch (err) {
      console.error('Login error', err);
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      const { token, user } = response.data;
      await login(token, user);
      return { success: true, user };
    } catch (error) {
      console.error('Google Login error', error);
      return { success: false, error: error.response?.data?.message || 'Google Login failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      setRole(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, googleLogin, logout, updateProfile, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
