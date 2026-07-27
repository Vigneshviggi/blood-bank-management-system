import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import CampCard from '../components/CampCard';
import api from '../services/api';
import { Colors } from '../constants/Theme';
import GlassCard from '../components/ui/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/ui/Badge';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Alert } from 'react-native';

const fallbackCamps = [
  {
    _id: 'camp-1',
    title: 'Weekend Blood Drive',
    location: 'Gurgaon Community Center',
    date: '2026-07-12T10:00:00Z',
    registeredCount: 84,
    capacity: 150,
    healthCheckup: true,
  },
  {
    _id: 'camp-2',
    title: 'Rural Health Camp',
    location: 'Pune Sector 15',
    date: '2026-07-15T09:30:00Z',
    registeredCount: 46,
    capacity: 100,
    healthCheckup: false,
  },
];

const CampsScreen = ({ navigation }) => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registeredCamps, setRegisteredCamps] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const res = await api.get('/camps');
      const nextCamps = Array.isArray(res.data) ? res.data : fallbackCamps;
      setCamps(nextCamps.length ? nextCamps : fallbackCamps);
      
      if (user) {
        const regRes = await api.get('/camps/my-registrations');
        if (Array.isArray(regRes.data)) {
          setRegisteredCamps(regRes.data);
        }
      }
    } catch (err) {
      console.error('Error fetching camps', err);
      setCamps(fallbackCamps);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCamps();
  };

  const handleRegister = async (camp) => {
    try {
      await api.post(`/camps/${camp._id}/register`, {
        userId: user._id || user.id,
        bloodGroup: user.bloodGroup || 'Unknown',
        contactInfo: user.phone || ''
      });
      setRegisteredCamps(prev => [...prev, camp._id]);
      
      // Optionally increment local count
      setCamps(prev => prev.map(c => 
        c._id === camp._id ? { ...c, registeredCount: (c.registeredCount || 0) + 1 } : c
      ));
    } catch (error) {
      console.error('Registration failed', error);
      Alert.alert('Registration Failed', 'You might already be registered for this camp.');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.title}>Blood Donation Camps</Text>
          <Text style={styles.subtitle}>Discover upcoming donation drives, see attendance and register instantly.</Text>
        </View>
        <Badge label="Live" variant="success" />
      </View>

      <FlatList
        data={camps}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CampCard 
            camp={item} 
            isRegistered={registeredCamps.includes(item._id)}
            onPress={() => navigation.navigate('CampDetails', { camp: item })}
            onRegister={() => handleRegister(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No upcoming camps found.</Text>
          </GlassCard>
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
});

export default CampsScreen;
