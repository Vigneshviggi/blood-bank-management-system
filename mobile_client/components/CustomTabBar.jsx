import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Home,
  HeartPulse,
  CalendarDays,
  Bell,
  User,
  Droplets,
  Users,
  Hospital,
  BarChart3,
} from 'lucide-react-native';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';

// Covers every tab name used across UserTabs, HospitalTabs and AdminTabs.
// SVG icons (not font glyphs) so there is nothing to "finish loading" — they
// paint on the very first frame, unlike Ionicons which can flash as boxes.
const icons = {
  Home,
  Requests: HeartPulse,
  Camps: CalendarDays,
  Notifications: Bell,
  Profile: User,
  Inventory: Droplets,
  Users,
  Hospitals: Hospital,
  Analytics: BarChart3,
};

const TabButton = ({ route, isFocused, label, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const Icon = icons[route.name] || Home;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onPressIn={() => animateTo(0.88)}
      onPressOut={() => animateTo(1)}
      style={styles.tab}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <Icon
          size={24}
          color={isFocused ? Colors.primary : Colors.textMuted}
          strokeWidth={isFocused ? 2.4 : 2}
        />
        <Text style={[styles.label, isFocused && styles.activeLabel]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="light" style={styles.blur}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            if (options.tabBarButton) {
              const btn = options.tabBarButton();
              if (btn === null) return null;
            }

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
                if (route.name === 'Profile') {
                  navigation.navigate('Profile', { screen: 'ProfileScreen', params: { userId: null } });
                } else {
                  navigation.navigate(route.name);
                }
              }
            };

            return (
              <TabButton
                key={route.key}
                route={route}
                isFocused={isFocused}
                label={label}
                onPress={onPress}
              />
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
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    fontFamily: Typography.heading,
    marginTop: 3,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: '800',
  },
});

export default CustomTabBar;
