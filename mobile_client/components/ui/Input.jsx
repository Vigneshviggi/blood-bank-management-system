import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Typography } from '../../constants/Theme';

const Input = ({ label, error, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: Typography.heading,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 54,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: Typography.body,
    paddingVertical: 12,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
