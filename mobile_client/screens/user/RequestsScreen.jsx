import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import RequestCard from '../../components/RequestCard';
import api from '../../services/api';
import { Colors } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';

const fallbackRequests = [
  {
    _id: 'req-1',
    patientName: 'Aarav',
    location: 'Bandra, Mumbai',
    bloodGroup: 'O+',
    unitsNeeded: 2,
    emergencyLevel: 'High',
    reason: 'Emergency surgery planned this evening',
    requiredDate: '2026-07-09T10:00:00Z',
    status: 'Pending',
    requesterType: 'hospital',
  },
  {
    _id: 'req-2',
    patientName: 'Meera',
    location: 'Koramangala, Bengaluru',
    bloodGroup: 'AB-',
    unitsNeeded: 1,
    emergencyLevel: 'Critical',
    reason: 'Road accident victim needs immediate transfusion',
    requiredDate: '2026-07-08T18:30:00Z',
    status: 'Pending',
    requesterType: 'hospital',
  },
];

const RequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      const nextRequests = Array.isArray(res.data) ? res.data : fallbackRequests;
      setRequests(nextRequests.length ? nextRequests : fallbackRequests);
    } catch (err) {
      console.error('Error fetching requests', err);
      setRequests(fallbackRequests);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const renderFilter = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'All' },
        { key: 'high', label: 'High' },
        { key: 'critical', label: 'Critical' },
        { key: 'pending', label: 'Pending' },
      ].map((option) => (
        <TouchableOpacity 
          key={option.key}
          style={[styles.filterBtn, filter === option.key && styles.filterBtnActive]}
          onPress={() => setFilter(option.key)}
        >
          <Text style={[styles.filterText, filter === option.key && styles.filterTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return String(request.status || 'Pending') === 'Pending';
    return String(request.emergencyLevel || '').toLowerCase() === filter;
  });

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Emergency Requests</Text>
          <Text style={styles.heroSubtitle}>Browse urgent blood requests and respond in seconds.</Text>
        </View>
        <Badge label={`${requests.length} Live`} variant="primary" />
      </View>

      <TouchableOpacity 
        style={styles.newRequestBtn} 
        onPress={() => navigation.navigate('BloodRequest')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{marginRight: 8}} />
        <Text style={styles.newRequestBtnText}>Request Blood</Text>
      </TouchableOpacity>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickChip} onPress={() => navigation.navigate('MyResponses')}>
          <Text style={styles.quickChipText}>My Responses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickChip} onPress={() => navigation.navigate('CompletedRequests')}>
          <Text style={styles.quickChipText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {renderFilter()}

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RequestCard 
            request={item} 
            onRespond={() => navigation.navigate('RequestDetails', { request: item })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="search-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No blood requests found matching your filters.</Text>
          </GlassCard>
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  newRequestBtn: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#E53935',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  newRequestBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickChip: {
    flex: 1,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickChipText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
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

export default RequestsScreen;
