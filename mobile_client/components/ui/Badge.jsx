import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Theme';

const variants = {
  primary: {
    backgroundColor: Colors.primarySoft,
    color: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondarySoft,
    color: Colors.secondaryDark,
  },
  success: {
    backgroundColor: 'rgba(14, 159, 110, 0.12)',
    color: Colors.success,
  },
  warning: {
    backgroundColor: 'rgba(220, 118, 9, 0.12)',
    color: Colors.warning,
  },
  info: {
    backgroundColor: 'rgba(45, 108, 223, 0.12)',
    color: Colors.info,
  },
  neutral: {
    backgroundColor: 'rgba(110, 103, 113, 0.10)',
    color: Colors.textSecondary,
  },
};

const Badge = ({ label, variant = 'neutral', style, textStyle }) => {
  const selected = variants[variant] || variants.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: selected.backgroundColor }, style]}>
      <Text style={[styles.text, { color: selected.color }, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

export default Badge;
