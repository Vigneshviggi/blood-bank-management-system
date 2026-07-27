import React, { useEffect, useRef } from "react";
import './i18n'; // Import i18n config
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { NetworkProvider } from "./context/NetworkContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppNavigator from "./navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View, BackHandler, Alert, AppState } from "react-native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Colors } from './constants/Theme';
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/OfflineBanner";
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

// Configure push notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // BackHandler for Android
    const backAction = () => {
      Alert.alert("Exit App?", "Are you sure you want to exit?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => BackHandler.exitApp() }
      ]);
      return true; // Return true to prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Request Notification Permissions on launch
    const setupNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      // Get the token (Needs an Expo project ID if not in Expo Go, but works locally)
      try {
        const Constants = require('expo-constants').default;
        if (Constants.appOwnership !== 'expo') {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          console.log("Push Token:", tokenData.data);
        } else {
          console.log("Running in Expo Go, skipping remote push token generation.");
        }
      } catch (e) {
        console.log("Error getting push token", e);
      }
    };
    setupNotifications();

    return () => {
      backHandler.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <NetworkProvider>
            <AuthProvider>
              <SocketProvider>
                <NotificationProvider>
                  <OfflineBanner />
                  <AppNavigator />
                  <Toast />
                  <StatusBar style="light" />
                </NotificationProvider>
              </SocketProvider>
            </AuthProvider>
          </NetworkProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
