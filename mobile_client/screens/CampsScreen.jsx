import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import CampCard from '../components/CampCard';
import api from '../services/api';
import { Colors } from '../constants/Theme';
import GlassCard from '../components/ui/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/ui/Badge';

const CampsScreen = ({ navigation }) => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const res = await api.get('/api/camps');
      setCamps(res.data);
    } catch (err) {
      console.error('Error fetching camps', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCamps();
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
            onPress={() => navigation.navigate('CampDetails', { camp: item })}
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
