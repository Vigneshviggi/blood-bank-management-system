import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Theme';

const PRIORITIES = ['Normal', 'High', 'Critical'];

export default function PrioritySelector({ selectedPriority, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Priority Level</Text>
      
      <View style={styles.row}>
        {PRIORITIES.map((level) => {
          const isActive = selectedPriority === level;
          let activeStyle = {};
          if (isActive) {
            if (level === 'High') activeStyle = { backgroundColor: '#F59E0B', borderColor: '#F59E0B' };
            else if (level === 'Critical') activeStyle = { backgroundColor: Colors.error, borderColor: Colors.error };
            else activeStyle = { backgroundColor: Colors.textSecondary, borderColor: Colors.textSecondary };
          }

          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.button,
                isActive && activeStyle
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
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  textActive: {
    color: '#FFFFFF',
  },
});
