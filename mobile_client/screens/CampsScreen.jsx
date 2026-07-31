import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import CampCard from '../components/CampCard';
import api from '../services/api';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';
import GlassCard from '../components/ui/GlassCard';
import EmptyStateView from '../components/EmptyStateView';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/ui/Badge';
import { AuthContext } from '../context/AuthContext';

const CampsScreen = ({ navigation }) => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registeredCamps, setRegisteredCamps] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCamps();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegisteredCamps();
    } else {
      setRegisteredCamps([]);
    }
  }, [user]);

  const fetchCamps = async () => {
    try {
      const res = await api.get('/camps');
      setCamps(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error('Error fetching camps', err);
      setCamps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRegisteredCamps = async () => {
    try {
      const regRes = await api.get('/camps/my-registrations');
      setRegisteredCamps(Array.isArray(regRes.data) ? regRes.data : regRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching camp registrations', err);
      setRegisteredCamps([]);
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
          <EmptyStateView
            title="No upcoming camps"
            message="There are no scheduled blood donation camps right now. Check back later for new events."
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.soft,
  },
  heroText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
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
    fontSize: 15,
  },
});

export default CampsScreen;
