import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function BloodGroupSelector({ selectedGroup, onSelect, error }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>
        Blood Group Needed *
      </Text>
      
      <View style={styles.grid}>
        {BLOOD_GROUPS.map((group) => {
          const isActive = selectedGroup === group;

          return (
            <AnimatedTouchable
              key={group}
              style={[
                styles.button,
                isActive && styles.buttonActive,
                error && !selectedGroup && styles.buttonError
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(group);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.text, isActive && styles.textActive]}>
                {group}
              </Text>
            </AnimatedTouchable>
          );
        })}
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
    color: '#FF5252',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // Counteract the padding of children
  },
  button: {
    width: '22%',
    marginHorizontal: '1.5%', // 4 items per row, spacing between them
    backgroundColor: '#2A2A2A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderColor: '#E53935',
  },
  buttonError: {
    borderColor: 'rgba(255, 82, 82, 0.5)',
  },
  text: {
    color: '#AAA',
    fontWeight: '700',
    fontSize: 16,
  },
  textActive: {
    color: '#E53935',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
