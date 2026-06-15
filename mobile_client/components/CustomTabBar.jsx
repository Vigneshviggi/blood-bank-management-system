import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';

const icons = {
  Home: 'home',
  Requests: 'medkit',
  Camps: 'calendar',
  Notifications: 'notifications',
  Profile: 'person',
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="light" style={styles.blur}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={icons[route.name]}
                  size={28}
                  color={isFocused ? Colors.primary : Colors.textMuted}
                  style={isFocused ? styles.activeIcon : styles.icon}
                />
                <Text style={[styles.label, isFocused && styles.activeLabel]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Shadows.strong,
  },
  blur: {
    borderRadius: Radius.xl,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  icon: {
    marginBottom: 2,
    opacity: 0.7,
  },
  activeIcon: {
    marginBottom: 2,
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700',
    fontFamily: Typography.heading,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: '800',
  },
});

export default CustomTabBar;
