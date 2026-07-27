import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

const PRIORITIES = ['Normal', 'High', 'Critical'];

export default function PrioritySelector({ selectedPriority, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Priority Level</Text>
      
      <View style={styles.row}>
        {PRIORITIES.map((level) => {
          const isActive = selectedPriority === level;
          
          let activeColor = '#4CAF50'; // Normal
          if (level === 'High') activeColor = '#FF9800';
          if (level === 'Critical') activeColor = '#F44336';

          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.button,
                isActive && { backgroundColor: activeColor, borderColor: activeColor }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(level);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.text,
                  isActive && styles.textActive
                ]}
              >
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  text: {
    color: '#AAA',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  textActive: {
    color: '#FFF',
  },
});
