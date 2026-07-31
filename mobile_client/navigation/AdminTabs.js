import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CustomTabBar from '../components/CustomTabBar';
import AdminDashboard from '../screens/AdminDashboard';
import UsersManagement from '../screens/UsersManagement';
import HospitalsManagement from '../screens/HospitalsManagement';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import MonitoringScreen from '../screens/MonitoringScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RequestHistoryScreen from '../screens/RequestHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const AdminHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    <Stack.Screen name="UsersManagement" component={UsersManagement} />
    <Stack.Screen name="HospitalsManagement" component={HospitalsManagement} />
    <Stack.Screen name="MonitoringScreen" component={MonitoringScreen} />
    <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
  </Stack.Navigator>
);

const AdminTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Tab.Screen name="Home" component={AdminHomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Users" component={UsersManagement} options={{ title: 'Users' }} />
      <Tab.Screen name="Hospitals" component={HospitalsManagement} options={{ title: 'Hospitals' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdminTabs;
