import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusIndicator = ({ status }) => {
  let color = '#bdbdbd';
  let label = 'Pending';
  if (status === 'accepted') {
    color = '#43a047';
    label = 'Accepted';
  } else if (status === 'rejected') {
    color = '#e53935';
    label = 'Rejected';
  } else if (status === 'completed') {
    color = '#1976d2';
    label = 'Completed';
  }
  return (
    <View style={[styles.indicator, { backgroundColor: color }]}> 
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
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

export default StatusIndicator;
