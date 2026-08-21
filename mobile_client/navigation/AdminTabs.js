import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CustomTabBar from '../components/CustomTabBar';
import AdminDashboard from '../screens/AdminDashboard';
import MonitoringScreen from '../screens/MonitoringScreen';
import ReportsScreen from '../screens/ReportsScreen';
import UsersManagement from '../screens/UsersManagement';
import HospitalsManagement from '../screens/HospitalsManagement';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RequestHistoryScreen from '../screens/RequestHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const stackScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 250,
};

// Wraps AdminDashboard so its console tiles ("Live Activity" / "System Reports")
// resolve to real, in-stack screens instead of unregistered route names.
const HomeStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="AdminHome" component={AdminDashboard} />
    <Stack.Screen name="MonitoringScreen" component={MonitoringScreen} />
    <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const AdminTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Users" component={UsersManagement} options={{ title: 'Users' }} />
      <Tab.Screen name="Hospitals" component={HospitalsManagement} options={{ title: 'Hospitals' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdminTabs;
