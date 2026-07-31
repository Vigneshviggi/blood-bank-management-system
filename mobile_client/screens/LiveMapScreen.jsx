import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from '../components/MapWrapper';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Colors } from '../constants/Theme';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { MapPin, ArrowLeft } from 'lucide-react-native';

const LiveMapScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [camps, setCamps] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Allow location access to view nearby blood centers.');
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

        // Fetch Data
        fetchMapData();
      } catch (error) {
        console.error("Location error", error);
        setLoading(false);
      }
    })();
  }, []);

  const fetchMapData = async () => {
    try {
      const [campsRes, hospRes, reqRes] = await Promise.all([
        api.get('/camps'),
        api.get('/hospitals'),
        api.get('/requests?status=Pending')
      ]);
      setCamps(campsRes.data);
      setHospitals(hospRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error("Error fetching map data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Locating nearby facilities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Live Blood Map</Text>
        <View style={{ width: 44 }} />
      </View>

      <MapView
        style={styles.map}
        initialRegion={location || {
          latitude: 28.6139,
          longitude: 77.2090, // Default to New Delhi
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {camps.map(camp => (
          camp.latitude && camp.longitude ? (
            <Marker
              key={`camp-${camp._id}`}
              coordinate={{ latitude: camp.latitude, longitude: camp.longitude }}
              pinColor="green"
            >
              <Callout onPress={() => navigation.navigate('CampDetails', { camp })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{camp.title}</Text>
                  <Text style={styles.calloutDesc}>Camp • {new Date(camp.date).toLocaleDateString()}</Text>
                  <Text style={styles.actionText}>Tap for details</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        ))}

        {hospitals.map(hosp => (
          hosp.latitude && hosp.longitude ? (
            <Marker
              key={`hosp-${hosp._id}`}
              coordinate={{ latitude: hosp.latitude, longitude: hosp.longitude }}
              pinColor="blue"
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{hosp.name}</Text>
                  <Text style={styles.calloutDesc}>Hospital</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        ))}

        {requests.map(req => (
          req.latitude && req.longitude ? (
            <Marker
              key={`req-${req._id}`}
              coordinate={{ latitude: req.latitude, longitude: req.longitude }}
              pinColor="red"
            >
              <Callout onPress={() => navigation.navigate('RequestDetails', { request: req })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>Emergency: {req.bloodGroup}</Text>
                  <Text style={styles.calloutDesc}>{req.patientName || 'Patient'} needs blood</Text>
                  <Text style={styles.actionText}>Tap to respond</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        ))}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'green' }]} />
          <Text style={styles.legendText}>Camps</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'blue' }]} />
          <Text style={styles.legendText}>Hospitals</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'red' }]} />
          <Text style={styles.legendText}>Emergencies</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4EEEC',
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  calloutDesc: {
    fontSize: 14,
    color: '#6E6771',
  },
  actionText: {
    color: Colors.primary,
    marginTop: 5,
    fontWeight: 'bold',
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontWeight: '600',
    color: '#1D1B20',
  }
});

export default LiveMapScreen;
