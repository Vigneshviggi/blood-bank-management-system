import { Linking, Alert, Platform } from 'react-native';

export const openCampNavigation = async (camp) => {
  try {
    let latitude = camp.latitude;
    let longitude = camp.longitude;

    // Support coordinates from GeoJSON point if latitude/longitude aren't directly available
    if ((!latitude || !longitude) && camp.coordinates && camp.coordinates.coordinates && camp.coordinates.coordinates.length >= 2) {
      longitude = camp.coordinates.coordinates[0];
      latitude = camp.coordinates.coordinates[1];
    }

    const address = camp.location || camp.venueName || camp.fullAddress;

    let url = '';

    if (latitude && longitude) {
      // If we have precise coordinates
      const lat = Number(latitude);
      const lng = Number(longitude);
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      
    } else if (address) {
      // Fallback to text search
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    } else {
      Alert.alert(
        "Navigation unavailable",
        "Unable to open maps. Please check the camp location."
      );
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Try to open it anyway, sometimes canOpenURL fails on Android 11+ due to package visibility
      await Linking.openURL(url);
    }
  } catch (error) {
    Alert.alert(
      "Navigation Error",
      "Unable to open maps. Please ensure you have a maps application installed."
    );
  }
};
