import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';

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

  const capacity = Number(camp.capacity || 0);
  const registered = Number(camp.registeredCount || 0);
  const occupancy = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Image source={{ uri: camp.bannerImage }} style={styles.banner} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>{camp.title}</Text>
          <Badge label={registered ? 'Registered' : 'Open'} variant={registered ? 'success' : 'primary'} />
        </View>

        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{new Date(camp.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>{camp.location}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Capacity</Text>
              <Text style={styles.summaryValue}>{capacity || 'Unlimited'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Registered</Text>
              <Text style={styles.summaryValue}>{registered}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${occupancy}%` }]} />
          </View>
          <Text style={styles.progressText}>{occupancy}% capacity filled</Text>
        </GlassCard>

        <GlassCard style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>About the camp</Text>
          <Text style={styles.description}>{camp.description || 'Community blood donation camp with on-site registration and support.'}</Text>
          <View style={styles.metaGrid}>
            <Badge label={camp.healthCheckup ? 'Health Check Available' : 'No Health Check'} variant={camp.healthCheckup ? 'success' : 'neutral'} />
            <Badge label={camp.organizer || 'Organizer'} variant="info" />
          </View>
        </GlassCard>

        {registered ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel Registration</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <Text style={styles.registerText}>Register Now</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  detailsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
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
