import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Colors, Radius, Shadows } from '../../constants/Theme';

const GlassCard = ({ children, style }) => {
  return (
    <View style={[styles.card, Platform.OS === 'web' ? styles.webCard : styles.nativeCard, style]}>
      <View style={styles.hairline} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  nativeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  webCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});

export default GlassCard;
