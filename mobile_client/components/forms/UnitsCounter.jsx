import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Theme';

export default function UnitsCounter({ units, onChange, error }) {
  const handleMinus = () => {
    if (units > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(units - 1);
    }
  };

  const handlePlus = () => {
    if (units < 10) { // arbitrary max limit to prevent misuse
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(units + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>
        Units Required *
      </Text>
      
      <View style={styles.counterRow}>
        <TouchableOpacity 
          style={[styles.button, units <= 1 && styles.buttonDisabled]} 
          onPress={handleMinus}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>
        
        <Text style={styles.valueText}>{units}</Text>
        
        <TouchableOpacity 
          style={[styles.button, units >= 10 && styles.buttonDisabled]} 
          onPress={handlePlus}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelError: {
    color: Colors.error,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32, // to center properly vertically on Android
  },
  valueText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 16,
    width: 32,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});
