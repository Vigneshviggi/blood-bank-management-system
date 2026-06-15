import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import HospitalStack from './HospitalStack';
import ManageCamps from '../screens/ManageCamps';
import InventoryScreen from '../screens/InventoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors } from '../constants/Theme';

const Tab = createBottomTabNavigator();

const HospitalTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HospitalStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Camps" component={ManageCamps} options={{ title: 'Camps' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Stock' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default HospitalTabs;
