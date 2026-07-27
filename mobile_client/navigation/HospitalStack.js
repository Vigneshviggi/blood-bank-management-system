import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HospitalDashboard from '../screens/HospitalDashboard';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import BloodRequestsScreen from '../screens/BloodRequestsScreen';
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
    </Stack.Navigator>
  );
};

export default HospitalStack;
