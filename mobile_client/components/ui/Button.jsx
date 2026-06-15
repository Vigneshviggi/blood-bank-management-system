import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius, Shadows, Typography } from '../../constants/Theme';

const Button = ({ title, onPress, loading, variant = 'primary', style }) => {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        style
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, (isOutline || isSecondary) && styles.textOutline]}>
          {title}
        </Text>
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
    paddingHorizontal: 18,
    ...Shadows.medium,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
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
  textOutline: {
    color: Colors.primary,
  },
});

export default Button;
