import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Theme';
import { MapPin } from 'lucide-react-native';

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <MapPin size={48} color={Colors.primary} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Maps Not Supported on Web</Text>
      <Text style={styles.subtitle}>Please use the iOS or Android mobile app to view live tracking and nearby hospitals.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  }
});

export default MapScreen;
