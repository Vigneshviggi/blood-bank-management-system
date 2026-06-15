import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CustomTabBar from '../components/CustomTabBar';
import HospitalStack from './HospitalStack';
import ManageCamps from '../screens/ManageCamps';
import InventoryScreen from '../screens/InventoryScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestHistoryScreen from '../screens/RequestHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

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
      <Tab.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default HospitalTabs;
