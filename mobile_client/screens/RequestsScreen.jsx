import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RequestsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Requests</Text>
      {/* Request list, forms, and real-time updates go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 16,
  },
});

export default RequestsScreen;
