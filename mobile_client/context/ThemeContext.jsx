import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme || 'light');

  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDarkMode = theme === 'dark';

  const colors = {
    background: isDarkMode ? '#121212' : '#F8F9FA',
    surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1F2937',
    textSecondary: isDarkMode ? '#A1A1AA' : '#6B7280',
    primary: '#ef4444',
    border: isDarkMode ? '#333333' : '#E5E7EB',
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
