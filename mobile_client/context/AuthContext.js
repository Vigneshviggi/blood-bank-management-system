import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

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
        if (decoded.exp < currentTime) {
          await logout();
        } else {
          const profileResponse = await api.get('/api/users/profile');
          const profile = profileResponse.data?.user;
          setUser(profile || decoded);
          setRole(profile?.role || decoded.role);
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
      setUser(profile || decoded);
      setRole(profile?.role || decoded.role);
    } catch (err) {
      console.error('Login error', err);
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
    <AuthContext.Provider value={{ user, role, loading, login, logout, updateProfile, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
