import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthStack from './AuthStack';
import MainNavigator from './MainNavigator';

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  const { colors } = useTheme();

  if (loading) {
    return null;
  }

  const navigationTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary || colors.tint || '#C81E4A',
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent || '#2D6CDF',
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <MainNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
