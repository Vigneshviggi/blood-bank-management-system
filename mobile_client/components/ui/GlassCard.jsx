import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows } from '../../constants/Theme';

// flat: true renders a plain translucent card instead of a real BlurView.
// Use flat cards inside FlatList rows / long lists (Users, Hospitals, Requests) —
// rendering many live blur surfaces at once is a measurable scroll-perf cost,
// especially on Android. Reserve real blur (flat={false}, the default) for
// hero sections / single cards where the visual effect actually matters.
const GlassCard = ({ children, style, intensity = 80, tint = 'light', flat = false }) => {
  if (flat || Platform.OS === 'web') {
    return (
      <View style={[styles.card, styles.flatCard, style]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.card, style]}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  flatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
});

export default GlassCard;
