import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from '../components/MapWrapper';
import * as Location from 'expo-location';
import { Colors } from '../constants/Theme';
import api from '../services/api';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      try {
        const [hospitalsRes, requestsRes, campsRes] = await Promise.all([
          api.get('/hospitals'),
          api.get('/requests'),
          api.get('/camps')
        ]);

        setHospitals(hospitalsRes.data || []);
        setRequests(requestsRes.data || []);
        setCamps(campsRes.data || []);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={location || {
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        showsUserLocation={true}
      >
        {hospitals.map((hospital, index) => {
          if (!hospital.coordinates || !hospital.coordinates.coordinates || hospital.coordinates.coordinates.length !== 2) {
            return null; // Do not render fake markers
          }
          
          let coords = {
            latitude: hospital.coordinates.coordinates[1],
            longitude: hospital.coordinates.coordinates[0]
          };

          return (
            <Marker
              key={hospital._id || `hospital-${index}`}
              coordinate={coords}
              pinColor={Colors.primary}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  <Text style={styles.hospitalDetails}>{hospital.address}</Text>
                  <Text style={styles.hospitalDetails}>Phone: {hospital.phone}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {requests.map((request, index) => {
          const lat = Number(request.latitude || request.coordinates?.coordinates?.[1] || 0);
          const lon = Number(request.longitude || request.coordinates?.coordinates?.[0] || 0);

          if (!lat || !lon) return null;

          return (
            <Marker
              key={request._id || `request-${index}`}
              coordinate={{ latitude: lat, longitude: lon }}
              pinColor="#8F1338"
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.hospitalName}>{request.patientName || 'Blood Request'}</Text>
                  <Text style={styles.hospitalDetails}>{request.bloodGroup} • {request.unitsNeeded} units</Text>
                  <Text style={styles.hospitalDetails}>{request.location}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {camps.map((camp, index) => {
          const lat = Number(camp.latitude || camp.coordinates?.coordinates?.[1] || 0);
          const lon = Number(camp.longitude || camp.coordinates?.coordinates?.[0] || 0);

          if (!lat || !lon) return null;

          return (
            <Marker
              key={camp._id || `camp-${index}`}
              coordinate={{ latitude: lat, longitude: lon }}
              pinColor="#DC7609"
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.hospitalName}>{camp.title}</Text>
                  <Text style={styles.hospitalDetails}>{camp.location}</Text>
                  <Text style={styles.hospitalDetails}>{camp.status}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  callout: {
    width: 200,
    padding: 5,
  },
  hospitalName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  hospitalDetails: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textLight,
  }
});

export default MapScreen;
