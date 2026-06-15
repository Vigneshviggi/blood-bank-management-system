import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Theme';

const variants = {
  primary: {
    backgroundColor: 'rgba(217, 45, 32, 0.12)',
    color: Colors.primary,
  },
  success: {
    backgroundColor: 'rgba(3, 152, 85, 0.12)',
    color: Colors.success,
  },
  warning: {
    backgroundColor: 'rgba(220, 104, 3, 0.12)',
    color: Colors.warning,
  },
  info: {
    backgroundColor: 'rgba(46, 144, 250, 0.12)',
    color: Colors.info,
  },
  neutral: {
    backgroundColor: 'rgba(102, 112, 133, 0.12)',
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
    paddingHorizontal: 10,
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
