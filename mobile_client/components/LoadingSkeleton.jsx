import React from 'react';
import { View, StyleSheet } from 'react-native';

const LoadingSkeleton = ({ height = 20, width = '100%', borderRadius = 8, style }) => (
  <View style={[styles.skeleton, { height, width, borderRadius }, style]} />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#ececec',
    marginBottom: 10,
    opacity: 0.7,
  },
});

export default LoadingSkeleton;
