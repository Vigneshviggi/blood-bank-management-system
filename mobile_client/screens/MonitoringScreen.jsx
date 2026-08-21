import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Activity, AlertTriangle, ChevronLeft } from 'lucide-react-native';

const MonitoringScreen = ({ navigation }) => {
  const socket = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);

  const fetchActivity = async () => {
    try {
      const res = await api.get('/requests');
      const sorted = [...(res.data || [])].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setRequests(sorted.slice(0, 30));
    } catch (err) {
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  // Live-tail anything the socket pushes, on top of the polled snapshot above.
  useEffect(() => {
    if (!socket) return;
    const onRequestUpdate = (payload) => {
      setLiveEvents((prev) => [
        { id: `${Date.now()}-${Math.random()}`, ...payload, receivedAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 20));
    };
    socket.on('request_update', onRequestUpdate);
    socket.on('emergency_alert', onRequestUpdate);
    return () => {
      socket.off('request_update', onRequestUpdate);
      socket.off('emergency_alert', onRequestUpdate);
    };
  }, [socket]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivity();
  };

  const criticalCount = requests.filter(
    (r) => String(r.emergencyLevel || '').toLowerCase() === 'critical'
  ).length;

  return (
    <ScreenContainer scrollable={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={20} color={Colors.text} />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>System Monitoring</Text>
          <Text style={styles.subtitle}>Live request activity and emergency signals across the platform.</Text>
        </View>
        <Badge label={socket ? 'Live' : 'Offline'} variant={socket ? 'success' : 'neutral'} />
      </View>

      <View style={styles.statsRow}>
        <GlassCard style={styles.statBox}>
          <Activity size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{requests.length}</Text>
          <Text style={styles.statLabel}>Tracked Requests</Text>
        </GlassCard>
        <GlassCard style={styles.statBox}>
          <AlertTriangle size={20} color={Colors.error} />
          <Text style={styles.statValue}>{criticalCount}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </GlassCard>
      </View>

      {liveEvents.length > 0 && (
        <GlassCard style={styles.liveCard}>
          <Text style={styles.liveTitle}>Live Feed</Text>
          {liveEvents.slice(0, 5).map((event) => (
            <Text key={event.id} style={styles.liveItem} numberOfLines={1}>
              • {event.message || event.status || 'Update received'} — {new Date(event.receivedAt).toLocaleTimeString()}
            </Text>
          ))}
        </GlassCard>
      )}

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        renderItem={({ item }) => (
          <GlassCard style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.patientName || item.hospitalName || 'Blood Request'}</Text>
              <Text style={styles.rowSubtitle}>{item.location || 'Unknown location'}</Text>
            </View>
            <Badge
              label={item.status || 'Pending'}
              variant={item.status === 'Completed' ? 'success' : item.status === 'Cancelled' ? 'neutral' : 'warning'}
            />
          </GlassCard>
        )}
        ListEmptyComponent={
          !loading && (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent activity to show.</Text>
            </GlassCard>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerCopy: {
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
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  liveCard: {
    marginBottom: 14,
  },
  liveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  liveItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 120,
  },
});

export default MonitoringScreen;
