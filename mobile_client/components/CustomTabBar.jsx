import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

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
                  color={isFocused ? '#e53935' : '#888'}
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
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  blur: {
    borderRadius: 32,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 32,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
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
    color: '#888',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#e53935',
    fontWeight: '700',
  },
});

export default CustomTabBar;
