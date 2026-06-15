import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Theme';
import { PlusCircle, Beaker, Megaphone, Users, Activity, BarChart3, Heart, Search, MapPin, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const QuickActions = ({ role }) => {
  const navigation = useNavigation();

  let actions = [];
  if (role === 'hospital') {
    actions = [
      { label: 'New Request', color: Colors.primary, icon: <PlusCircle size={20} color="#fff" />, target: 'CreateRequest' },
      { label: 'Stock Update', color: '#1E88E5', icon: <Beaker size={20} color="#fff" />, target: 'Inventory' },
      { label: 'Organize Camp', color: '#43A047', icon: <Megaphone size={20} color="#fff" />, target: 'Camps' },
    ];
  } else if (role === 'admin') {
    actions = [
      { label: 'Verify', color: Colors.primary, icon: <Users size={20} color="#fff" />, target: 'HospitalsManagement' },
      { label: 'Monitor', color: '#1E88E5', icon: <Activity size={20} color="#fff" />, target: 'MonitoringScreen' },
      { label: 'Reports', color: '#43A047', icon: <BarChart3 size={20} color="#fff" />, target: 'ReportsScreen' },
    ];
  } else {
    actions = [
      { label: 'Donate', color: Colors.primary, icon: <Heart size={20} color="#fff" />, target: 'Requests' },
      { label: 'Search', color: '#1E88E5', icon: <Search size={20} color="#fff" />, target: 'Requests' },
      { label: 'Hospitals', color: '#43A047', icon: <MapPin size={20} color="#fff" />, target: 'Home' },
      { label: 'Camps', color: '#FB8C00', icon: <Calendar size={20} color="#fff" />, target: 'Camps' },
    ];
  }

  return (
    <View style={styles.container}>
      {actions.map((action, idx) => (
        <TouchableOpacity 
          key={idx} 
          style={[styles.action, { backgroundColor: action.color }]}
          onPress={() => action.target && navigation.navigate(action.target)}
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
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default QuickActions;

