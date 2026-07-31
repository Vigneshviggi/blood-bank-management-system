import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Theme';

const EmergencyBadge = ({ level }) => {
  const normalized = String(level || 'normal').toLowerCase();
  let color = Colors.secondaryDark;
  let label = 'Normal';
  if (normalized === 'critical') {
    color = '#8F1338';
    label = 'Critical';
  } else if (normalized === 'high' || normalized === 'urgent') {
    color = Colors.primary;
    label = 'High';
  } else if (normalized === 'medium') {
    color = Colors.warning;
    label = 'Medium';
  }
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.4,
  },
});

export default EmergencyBadge;
