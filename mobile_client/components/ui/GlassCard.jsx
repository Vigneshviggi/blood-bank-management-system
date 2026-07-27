import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Colors, Radius, Shadows } from '../../constants/Theme';

const GlassCard = ({ children, style }) => {
  return (
    <View style={[styles.card, Platform.OS === 'web' ? styles.webCard : styles.nativeCard, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  nativeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  webCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(14px)',
  },
});

export default GlassCard;

