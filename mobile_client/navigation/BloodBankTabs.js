import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CustomTabBar from '../components/CustomTabBar';
import BloodBankDashboard from '../screens/BloodBankDashboard';
import InventoryScreen from '../screens/InventoryScreen';
import BloodRequestScreen from '../screens/BloodRequestScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BloodBankStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BloodBankDashboard" component={BloodBankDashboard} />
  </Stack.Navigator>
);

const BloodBankTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={BloodBankStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Stock' }} />
      <Tab.Screen name="Requests" component={BloodRequestScreen} options={{ title: 'Requests' }} />
      <Tab.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default BloodBankTabs;
