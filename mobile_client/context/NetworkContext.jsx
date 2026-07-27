import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { AppState } from 'react-native';

const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
});

export const NetworkProvider = ({ children }) => {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  const checkNetwork = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    } catch (error) {
      console.log('Error checking network state', error);
    }
  };

  useEffect(() => {
    checkNetwork();

    // Re-check when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkNetwork();
      }
    });

    // In a bare React Native app, NetInfo would be better here for real-time listener,
    // but Expo Network relies on polling or app state changes mostly.
    // For simplicity with Expo Network, we'll poll every 10 seconds.
    const interval = setInterval(checkNetwork, 10000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
