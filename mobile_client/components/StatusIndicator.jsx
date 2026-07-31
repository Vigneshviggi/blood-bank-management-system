import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Theme';

const StatusIndicator = ({ status }) => {
  let color = Colors.textMuted;
  let label = 'Pending';
  if (status === 'accepted') {
    color = Colors.success;
    label = 'Accepted';
  } else if (status === 'rejected') {
    color = Colors.error;
    label = 'Rejected';
  } else if (status === 'completed') {
    color = Colors.accent;
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
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
});

export default StatusIndicator;
