import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HospitalDashboard from '../screens/HospitalDashboard';
import CreateRequestScreen from '../screens/CreateRequestScreen';

const Stack = createNativeStackNavigator();

const HospitalStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="HospitalDashboard" component={HospitalDashboard} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
};

export default HospitalStack;
