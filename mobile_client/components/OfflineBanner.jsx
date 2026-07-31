import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../context/NetworkContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetwork();
  const insets = useSafeAreaInsets();

  // If we're strictly offline, or connected to network but no internet
  const isOffline = !isConnected || isInternetReachable === false;

  if (!isOffline) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top }]}>
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#D92D20', // red-500
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 9999,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
