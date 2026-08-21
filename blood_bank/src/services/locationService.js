export const LOCATION_ERRORS = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
};

/**
 * Obtains genuine browser GPS coordinates using HTML5 Geolocation.
 * Never generates fallback or fake coordinates.
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
export const getCurrentCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('Geolocation is not supported by your browser.');
      err.code = LOCATION_ERRORS.NOT_SUPPORTED;
      return reject(err);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!position || !position.coords) {
          const err = new Error('Unable to retrieve location coordinates.');
          err.code = LOCATION_ERRORS.POSITION_UNAVAILABLE;
          return reject(err);
        }

        const { latitude, longitude } = position.coords;

        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          isNaN(latitude) ||
          isNaN(longitude)
        ) {
          const err = new Error('Invalid coordinates returned by browser.');
          err.code = LOCATION_ERRORS.POSITION_UNAVAILABLE;
          return reject(err);
        }

        resolve({ latitude, longitude });
      },
      (error) => {
        let code = LOCATION_ERRORS.POSITION_UNAVAILABLE;
        let message = 'Unable to determine your current location.';

        if (error.code === error.PERMISSION_DENIED) {
          code = LOCATION_ERRORS.PERMISSION_DENIED;
          message = 'Location permission was denied. Please enable location permissions in your browser.';
        } else if (error.code === error.TIMEOUT) {
          code = LOCATION_ERRORS.TIMEOUT;
          message = 'Location request timed out. Please try again.';
        }

        const customError = new Error(message);
        customError.code = code;
        reject(customError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
};

/**
 * Reverse geocodes coordinates to a human-readable city/district, state string.
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data?.address;
      if (addr) {
        const locality = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || addr.district;
        const region = addr.state || addr.country;
        if (locality && region) return `${locality}, ${region}`;
        if (locality) return locality;
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 2).join(',').trim();
        }
      }
    }
  } catch (_e) {
    // Fallback if network blocked or offline
  }
  return `${latitude.toFixed(3)}° N, ${longitude.toFixed(3)}° E`;
};

