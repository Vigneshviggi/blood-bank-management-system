import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function FormInput({ 
  label, 
  error, 
  maxLength, 
  value,
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
        {maxLength && (
          <Text style={styles.charCount}>
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
      
      <TextInput
        style={[
          styles.input,
          props.multiline && styles.inputMultiline,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        placeholderTextColor="#666"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelError: {
    color: '#FF5252',
  },
  charCount: {
    color: '#888',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: '#4A4A4A',
    backgroundColor: '#333',
  },
  inputError: {
    borderColor: 'rgba(255, 82, 82, 0.5)',
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});
