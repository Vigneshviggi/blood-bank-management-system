import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius, Shadows, Typography } from '../../constants/Theme';

// variant: 'primary' | 'secondary' | 'outline' | 'ghost'
const Button = ({ title, onPress, loading, variant = 'primary', disabled, style }) => {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isMuted = isOutline || isGhost;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.button,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={isMuted ? Colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, isMuted && styles.textMuted]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    minHeight: 54,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    ...Shadows.glow,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: Colors.primarySoft,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontFamily: Typography.heading,
  },
  textMuted: {
    color: Colors.primary,
  },
});

export default Button;
