import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SkeletonCard({ width = '100%', height = 100, style }) {
  const { isDarkMode } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });

  const backgroundColor = isDarkMode ? '#333333' : '#E5E7EB';

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, backgroundColor, opacity },
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 8,
    marginBottom: 12,
  }
});
