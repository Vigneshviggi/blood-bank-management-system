import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/user/HomeScreen';
import RequestsScreen from '../screens/user/RequestsScreen';
import MyResponsesScreen from '../screens/user/MyResponsesScreen';
import CompletedRequestsScreen from '../screens/user/CompletedRequestsScreen';
import CampsScreen from '../screens/CampsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestDetailsScreen from '../screens/RequestDetailsScreen';
import CampDetailsScreen from '../screens/CampDetailsScreen';
import BloodRequestScreen from '../screens/BloodRequestScreen';
import DonorsScreen from '../screens/DonorsScreen';
import RequestHistoryScreen from '../screens/RequestHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const stackScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 250,
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="DonorsScreen" component={DonorsScreen} />
    <Stack.Screen name="DonorProfile" component={ProfileScreen} />
    <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
    <Stack.Screen name="CampDetails" component={CampDetailsScreen} />
  </Stack.Navigator>
);

const RequestsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="RequestsScreen" component={RequestsScreen} />
    <Stack.Screen name="DonorsScreen" component={DonorsScreen} />
    <Stack.Screen name="DonorProfile" component={ProfileScreen} />
    <Stack.Screen name="BloodRequest" component={BloodRequestScreen} />
    <Stack.Screen name="MyResponses" component={MyResponsesScreen} />
    <Stack.Screen name="CompletedRequests" component={CompletedRequestsScreen} />
    <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
  </Stack.Navigator>
);

const CampsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="CampsScreen" component={CampsScreen} />
    <Stack.Screen name="CampDetails" component={CampDetailsScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} initialParams={{ userId: null }} />
    <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
    <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const UserTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Requests" component={RequestsStack} options={{ title: 'Requests' }} />
      <Tab.Screen name="Camps" component={CampsStack} options={{ title: 'Camps' }} />
      <Tab.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default UserTabs;
