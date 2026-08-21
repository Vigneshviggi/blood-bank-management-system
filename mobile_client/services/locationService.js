import * as Location from 'expo-location';

export const LOCATION_ERRORS = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SERVICE_DISABLED: 'SERVICE_DISABLED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
};

/**
 * Obtains real device GPS coordinates with high accuracy.
 * Never generates mock/fallback coordinates.
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
export const getCurrentCoordinates = async () => {
  try {
    const isServiceEnabled = await Location.hasServicesEnabledAsync();
    if (!isServiceEnabled) {
      const error = new Error('Location services are disabled.');
      error.code = LOCATION_ERRORS.SERVICE_DISABLED;
      throw error;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const error = new Error('Location permission was denied.');
      error.code = LOCATION_ERRORS.PERMISSION_DENIED;
      throw error;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
    });

    if (!location || !location.coords) {
      const error = new Error('Unable to retrieve GPS coordinates.');
      error.code = LOCATION_ERRORS.POSITION_UNAVAILABLE;
      throw error;
    }

    const { latitude, longitude } = location.coords;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      const error = new Error('Invalid GPS coordinates received.');
      error.code = LOCATION_ERRORS.POSITION_UNAVAILABLE;
      throw error;
    }

    return { latitude, longitude };
  } catch (error) {
    if (error.code) {
      throw error;
    }
    const genericError = new Error(error.message || 'Unable to determine your current location.');
    genericError.code = LOCATION_ERRORS.POSITION_UNAVAILABLE;
    throw genericError;
  }
};
