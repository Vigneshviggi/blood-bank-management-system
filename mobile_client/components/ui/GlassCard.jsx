import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows } from '../../constants/Theme';

const GlassCard = ({ children, style, intensity = 80, tint = 'light' }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.card, styles.webCard, style]}>
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
  webCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(14px)',
  },
});

export default GlassCard;

