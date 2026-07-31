import React, { createContext, useContext } from 'react';
import { Colors } from '../constants/Theme';

const ThemeContext = createContext({ colors: Colors });

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ colors: Colors }}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
