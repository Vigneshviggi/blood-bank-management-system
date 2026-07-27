import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import socketService from '../services/socket';
import api from '../services/api';
import * as Location from 'expo-location';
import { AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../constants/Theme';
import { useNavigation } from '@react-navigation/native';

const SOSScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleSOS = async () => {
    Alert.alert(
      "EMERGENCY SOS",
      "This will immediately notify all nearby donors and hospitals. Are you sure this is a critical emergency?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "BROADCAST SOS", 
          style: "destructive",
          onPress: triggerSOS
        }
      ]
    );
  };

  const triggerSOS = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { latitude: 0, longitude: 0 };
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        coords.latitude = loc.coords.latitude;
        coords.longitude = loc.coords.longitude;
      }

      // Create a critical request
      const res = await api.post('/requests', {
        patientName: user.name,
        bloodGroup: user.bloodGroup || 'O-', // fallback to universal
        unitsRequired: 1,
        emergencyLevel: 'Emergency',
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: 'Current Location',
        purpose: 'SOS BROADCAST',
      });

      // Blast via Socket
      socketService.emit('emergencySOS', {
        userId: user._id,
        name: user.name,
        bloodGroup: user.bloodGroup,
        coords
      });

      Alert.alert("SOS Sent", "Emergency broadcast sent to all nearby heroes and hospitals.");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to broadcast SOS. Please call emergency services directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ArrowLeft size={28} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <AlertTriangle size={64} color="#ff3b30" style={{ marginBottom: 20 }} />
        <Text style={styles.title}>EMERGENCY SOS</Text>
        <Text style={styles.subtitle}>
          Press the button below to instantly alert all nearby donors and blood banks.
        </Text>

        <TouchableOpacity onPress={handleSOS} disabled={loading}>
          <Animated.View style={[styles.sosButton, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.sosText}>{loading ? 'SENDING...' : 'SOS'}</Text>
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.warning}>
          Warning: Misuse of this feature may result in account suspension.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backBtn: {
    padding: 20,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  sosText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
  },
  warning: {
    marginTop: 50,
    color: '#ff3b30',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  }
});

export default SOSScreen;
