import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HospitalDashboard from '../screens/HospitalDashboard';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import BloodRequestsScreen from '../screens/BloodRequestsScreen';
import CampAttendeesScreen from '../screens/CampAttendeesScreen';
import { Colors } from '../constants/Theme';

const Stack = createNativeStackNavigator();

const HospitalStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="HospitalDashboard" component={HospitalDashboard} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="BloodRequests" component={BloodRequestsScreen} />
      <Stack.Screen name="CampAttendees" component={CampAttendeesScreen} />
    </Stack.Navigator>
  );
};

export default HospitalStack;
