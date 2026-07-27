import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import MainNavigator from './MainNavigator';
import GlobalSearchScreen from '../screens/GlobalSearchScreen';
import LiveMapScreen from '../screens/LiveMapScreen';
import SOSScreen from '../screens/SOSScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import CertificateScreen from '../screens/CertificateScreen';
import CampAttendeesScreen from '../screens/CampAttendeesScreen';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="GlobalSearch" 
              component={GlobalSearchScreen} 
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen name="LiveMap" component={LiveMapScreen} />
            <Stack.Screen name="SOS" component={SOSScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
            <Stack.Screen name="Certificate" component={CertificateScreen} />
            <Stack.Screen name="CampAttendees" component={CampAttendeesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
