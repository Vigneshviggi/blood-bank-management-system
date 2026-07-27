import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';
import { Activity, Clock, Droplet, MapPin, AlertTriangle } from 'lucide-react-native';
import api from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MonitoringScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      // Show pending/active requests sorted by creation date (newest first)
      const activeRequests = res.data
        .filter(r => r.status === 'Pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(activeRequests);
    } catch (err) {
      console.error('Error fetching live requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const criticalCount = requests.filter(r => r.isEmergency).length;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Activity size={28} color={Colors.primary} />
          <Text style={styles.title}>Live Monitor</Text>
        </View>
        <Badge label={`${requests.length} Active`} variant="primary" />
      </View>

      {criticalCount > 0 && (
        <View style={styles.criticalBanner}>
          <AlertTriangle size={20} color={Colors.error} />
          <Text style={styles.criticalText}>{criticalCount} Critical Emergencies Ongoing!</Text>
        </View>
      )}

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard style={[styles.card, item.isEmergency && styles.emergencyCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.bloodGroupBadge, item.isEmergency && styles.emergencyBg]}>
                  <Droplet size={14} color="#fff" />
                  <Text style={styles.bloodGroupText}>{item.bloodType}</Text>
                </View>
                {item.isEmergency && (
                  <Badge label="EMERGENCY" variant="error" />
                )}
              </View>
              <View style={styles.timeRow}>
                <Clock size={12} color={Colors.textSecondary} />
                <Text style={styles.timeText}>{dayjs(item.createdAt).fromNow()}</Text>
              </View>
            </View>

            <View style={styles.details}>
              <Text style={styles.patientName}>Patient: {item.patientName}</Text>
              <View style={styles.locationRow}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{item.hospitalName || item.location}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {item.unitsRequired} Units Required • {item.responses?.length || 0} Responses
              </Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active requests to monitor.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  criticalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  criticalText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  emergencyCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bloodGroupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  emergencyBg: {
    backgroundColor: Colors.error,
  },
  bloodGroupText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  details: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

export default MonitoringScreen;
