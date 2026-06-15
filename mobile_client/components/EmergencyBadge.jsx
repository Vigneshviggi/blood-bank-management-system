import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmergencyBadge = ({ level }) => {
  let color = '#e53935';
  let label = 'Normal';
  if (level === 'high') {
    color = '#d32f2f';
    label = 'High';
  } else if (level === 'medium') {
    color = '#fbc02d';
    label = 'Medium';
  } else if (level === 'low') {
    color = '#43a047';
    label = 'Low';
  }
  return (
    <View style={[styles.badge, { backgroundColor: color }]}> 
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default EmergencyBadge;
