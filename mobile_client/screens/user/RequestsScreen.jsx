import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import RequestCard from '../../components/RequestCard';
import api from '../../services/api';
import { Colors, Radius, Shadows, Typography } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import EmptyStateView from '../../components/EmptyStateView';

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
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (Array.isArray(res.data?.data)) {
        setRequests(res.data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching requests', err);
      setRequests([]);
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
          activeOpacity={0.85}
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
        activeOpacity={0.9}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.newRequestBtnText}>Request Blood</Text>
      </TouchableOpacity>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickChip} onPress={() => navigation.navigate('MyResponses')} activeOpacity={0.85}>
          <Text style={styles.quickChipText}>My Responses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickChip, { marginRight: 0 }]} onPress={() => navigation.navigate('CompletedRequests')} activeOpacity={0.85}>
          <Text style={styles.quickChipText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {renderFilter()}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 48 }} />
      ) : (
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
            <EmptyStateView title="No requests" message="There are no blood requests available at the moment." />
          }
          contentContainerStyle={[styles.listContent, filteredRequests.length === 0 && { flex: 1 }]}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.soft,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  newRequestBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: Radius.md,
    marginBottom: 16,
    ...Shadows.glow,
  },
  newRequestBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  quickRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quickChip: {
    flex: 1,
    backgroundColor: Colors.primarySoft,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginRight: 10,
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
    fontSize: 15,
  },
});

export default RequestsScreen;
