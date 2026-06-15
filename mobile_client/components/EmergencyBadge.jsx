import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Theme';

const EmergencyBadge = ({ level }) => {
  const normalized = String(level || 'normal').toLowerCase();
  let color = Colors.primary;
  let label = 'Normal';
  if (normalized === 'critical') {
    color = '#B42318';
    label = 'Critical';
  } else if (normalized === 'high' || normalized === 'urgent') {
    color = '#E07A00';
    label = 'High';
  } else if (normalized === 'medium') {
    color = '#F79009';
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default EmergencyBadge;
