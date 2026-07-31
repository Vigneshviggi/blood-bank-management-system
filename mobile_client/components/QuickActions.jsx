import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows } from '../constants/Theme';
import { PlusCircle, Beaker, Megaphone, Users, Activity, BarChart3, Heart, Search, MapPin, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const QuickActions = ({ role }) => {
  const navigation = useNavigation();

  let actions = [];
  if (role === 'hospital') {
    actions = [
      { label: 'New Request', color: Colors.primary, icon: <PlusCircle size={20} color="#fff" />, target: 'CreateRequest' },
      { label: 'Stock Update', color: Colors.accent, icon: <Beaker size={20} color="#fff" />, target: 'Inventory' },
      { label: 'Organize Camp', color: Colors.secondary, icon: <Megaphone size={20} color="#fff" />, target: 'Camps' },
    ];
  } else if (role === 'admin') {
    actions = [
      { label: 'Verify', color: Colors.primary, icon: <Users size={20} color="#fff" />, target: 'HospitalsManagement' },
      { label: 'Monitor', color: Colors.accent, icon: <Activity size={20} color="#fff" />, target: 'MonitoringScreen' },
      { label: 'Reports', color: Colors.secondary, icon: <BarChart3 size={20} color="#fff" />, target: 'ReportsScreen' },
    ];
  } else {
    actions = [
      { label: 'Donate', color: Colors.primary, icon: <Heart size={20} color="#fff" />, target: 'Requests' },
      { label: 'Search', color: Colors.accent, icon: <Search size={20} color="#fff" />, target: 'Requests' },
      { label: 'Hospitals', color: Colors.secondary, icon: <MapPin size={20} color="#fff" />, target: 'Home' },
      { label: 'Camps', color: Colors.warning, icon: <Calendar size={20} color="#fff" />, target: 'Camps' },
    ];
  }

  return (
    <View style={styles.container}>
      {actions.map((action, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.action, { backgroundColor: action.color }]}
          onPress={() => action.target && navigation.navigate(action.target)}
          activeOpacity={0.85}
        >
          {action.icon}
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  action: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default QuickActions;
