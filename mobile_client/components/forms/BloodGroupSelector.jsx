import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Theme';

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // Counteract the padding of children
  },
  button: {
    width: '22%',
    minHeight: 44,
    marginHorizontal: '1.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonActive: {
    backgroundColor: '#FDE7ED',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  buttonError: {
    borderColor: 'rgba(255, 82, 82, 0.5)',
  },
  text: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  textActive: {
    color: Colors.primary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
