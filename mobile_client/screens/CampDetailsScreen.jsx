import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { AuthContext } from '../context/AuthContext';

const CampDetailsScreen = ({ route, navigation }) => {
  const { camp: initialCamp } = route.params;
  const [camp, setCamp] = useState(initialCamp);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchCamp = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/camps/${camp._id}`);
      setCamp(res.data);
      
      if (user) {
        const regRes = await api.get(`/api/camps/${camp._id}/registration-status?userId=${user._id}`);
        if (regRes.data) {
          setRegistered(true);
        }
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post(`/api/camps/${camp._id}/register`, {
        userId: user._id,
        bloodGroup: user.bloodGroup || 'A+',
        contactInfo: user.phone || ''
      });
      setRegistered(true);
      await fetchCamp();
      Alert.alert('Success', 'Registered for the camp successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to register');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post(`/api/camps/${camp._id}/cancel-registration`, {
        userId: user._id
      });
      setRegistered(false);
      await fetchCamp();
      Alert.alert('Success', 'Registration cancelled');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCamp();
  }, []);

  if (loading) return <LoadingSkeleton height={60} />;

  return (
    <View style={styles.container}>
      <Image source={{ uri: camp.bannerImage }} style={styles.banner} />
      <Text style={styles.title}>{camp.title}</Text>
      <Text style={styles.detail}>Date: {camp.date}</Text>
      <Text style={styles.detail}>Location: {camp.location}</Text>
      <Text style={styles.detail}>Capacity: {camp.capacity}</Text>
      <Text style={styles.detail}>Registered: {camp.registeredCount}</Text>
      <Text style={styles.detail}>Description: {camp.description}</Text>
      <Text style={styles.detail}>Organizer: {camp.organizer}</Text>
      <Text style={styles.detail}>Health Checkup: {camp.healthCheckup ? 'Available' : 'Not Available'}</Text>
      {registered ? (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel Registration</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  banner: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  registerBtn: {
    backgroundColor: '#43a047',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#e53935',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CampDetailsScreen;
