import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

const SettingsScreen = () => {
  // Add dark mode, notification, theme, security, logout, etc.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {/* Settings toggles and options go here */}
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

export default SettingsScreen;
