import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from '../components/MapWrapper';
import * as Location from 'expo-location';
import socketService from '../services/socket';
import { Colors } from '../constants/Theme';
import { ArrowLeft, Phone, Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { AuthContext } from '../context/AuthContext';

const LiveTrackingScreen = ({ route }) => {
  const { request } = route.params || {};
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [donorLocation, setDonorLocation] = useState(null);
  const [destination, setDestination] = useState({
    latitude: request?.latitude || 0,
    longitude: request?.longitude || 0
  });

  const isDonor = user?.role === 'donor';

  useEffect(() => {
    let locationSubscription;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      if (isDonor) {
        // If I am the donor, I emit my location
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 50 },
          (loc) => {
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setDonorLocation(coords);
            socketService.emit('updateLocation', {
              requestId: request?._id,
              userId: user._id,
              coords
            });
          }
        );
      } else {
        // If I am the requester, I listen for the donor's location
        socketService.on('locationUpdated', (data) => {
          if (data.requestId === request?._id) {
            setDonorLocation(data.coords);
          }
        });
      }
    };

    startTracking();

    return () => {
      if (locationSubscription) locationSubscription.remove();
      if (!isDonor) socketService.socket?.off('locationUpdated');
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Live Tracking</Text>
        <View style={{ width: 44 }} />
      </View>

      <MapView
        style={styles.map}
        region={donorLocation ? {
          latitude: donorLocation.latitude,
          longitude: donorLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : {
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {donorLocation && (
          <Marker 
            coordinate={donorLocation} 
            title={isDonor ? "You" : "Donor"}
            pinColor="blue"
          />
        )}
        
        {destination.latitude !== 0 && (
          <Marker 
            coordinate={destination} 
            title="Destination"
            pinColor="red"
          />
        )}

        {donorLocation && destination.latitude !== 0 && (
          <Polyline 
            coordinates={[donorLocation, destination]}
            strokeColor={Colors.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <View style={styles.infoPanel}>
        <GlassCard style={styles.card}>
          <Text style={styles.panelTitle}>
            {isDonor ? "En route to Hospital" : "Donor is on the way"}
          </Text>
          <Text style={styles.panelSubtitle}>
            Request ID: {request?._id?.substring(0, 8).toUpperCase()}
          </Text>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Phone size={20} color="#fff" />
              <Text style={styles.actionText}>Contact</Text>
            </TouchableOpacity>
            {isDonor && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0E9F6E' }]}>
                <Navigation size={20} color="#fff" />
                <Text style={styles.actionText}>Navigate</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F4EEEC', borderRadius: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  map: { flex: 1 },
  infoPanel: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
  },
  card: { padding: 20 },
  panelTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  panelSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', backgroundColor: Colors.primary,
    padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8
  },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

export default LiveTrackingScreen;
