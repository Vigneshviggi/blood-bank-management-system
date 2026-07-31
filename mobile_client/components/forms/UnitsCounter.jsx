import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

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
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  labelError: {
    color: '#C81E4A',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 52,
    height: 52,
    backgroundColor: '#1D1B20',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1D1B20',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 32, // to center properly vertically on Android
  },
  valueText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginHorizontal: 30,
    minWidth: 32,
    textAlign: 'center',
  },
  errorText: {
    color: '#C81E4A',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});
