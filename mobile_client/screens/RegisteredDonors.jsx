import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RegisteredDonors = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registered Donors</Text>
      {/* Donor list, analytics, attendance tracking go here */}
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

export default RegisteredDonors;
