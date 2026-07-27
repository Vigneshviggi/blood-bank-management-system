import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Custom hook to execute a callback when the app returns to the foreground.
 * Useful for refreshing sockets, fetching latest data, or clearing badges.
 * 
 * @param {Function} onRefresh - Function to call when app becomes active
 */
export const useAppStateRefresh = (onRefresh) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground!
        if (typeof onRefresh === 'function') {
          onRefresh();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onRefresh]);
};
