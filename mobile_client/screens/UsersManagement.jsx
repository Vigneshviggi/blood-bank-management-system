import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const UsersManagement = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Users Management</Text>
      {/* User list, verification, management actions go here */}
    </ScrollView>
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

export default UsersManagement;
