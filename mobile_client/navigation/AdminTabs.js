import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import AdminDashboard from '../screens/AdminDashboard';
import UsersManagement from '../screens/UsersManagement';
import HospitalsManagement from '../screens/HospitalsManagement';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors } from '../constants/Theme';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={AdminDashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="Users" component={UsersManagement} options={{ title: 'Users' }} />
      <Tab.Screen name="Hospitals" component={HospitalsManagement} options={{ title: 'Hospitals' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdminTabs;
