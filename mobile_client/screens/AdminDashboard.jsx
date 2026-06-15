import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Users, Hospital, Activity, ShieldCheck, AlertCircle, BarChart3 } from 'lucide-react-native';

const AdminDashboard = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHospitals: 0,
    pendingVerifications: 0,
    activeRequests: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const [usersRes, hospitalsRes, requestsRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/hospitals'),
        api.get('/api/requests')
      ]);

      const hospitals = hospitalsRes.data || [];
      const users = usersRes.data || [];
      const requests = requestsRes.data || [];

      setStats({
        totalUsers: users.filter(u => u.role === 'user' || u.role === 'donor').length,
        totalHospitals: hospitals.length,
        pendingVerifications: hospitals.filter(h => !h.verified).length,
        activeRequests: requests.filter(r => r.status === 'open').length,
        totalDonations: 0 // Placeholder
      });
    } catch (err) {
      console.error('Error fetching admin stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminStats();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer scrollable={true}>
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>System Admin</Text>
          <Text style={styles.nameText}>Platform Overview</Text>
        </View>
        <View style={styles.adminBadge}>
          <ShieldCheck size={20} color={Colors.success} />
          <Text style={styles.adminBadgeText}>Verified Admin</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <GlassCard style={styles.statBox}>
          <Users size={24} color={Colors.accent} />
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Donors</Text>
        </GlassCard>
        <GlassCard style={styles.statBox}>
          <Hospital size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{stats.totalHospitals}</Text>
          <Text style={styles.statLabel}>Hospitals</Text>
        </GlassCard>
      </View>

      <View style={styles.statsGrid}>
        <GlassCard style={styles.statBox}>
          <Activity size={24} color={Colors.warning} />
          <Text style={styles.statValue}>{stats.activeRequests}</Text>
          <Text style={styles.statLabel}>Live Requests</Text>
        </GlassCard>
        <GlassCard style={styles.statBox}>
          <AlertCircle size={24} color={Colors.error} />
          <Text style={styles.statValue}>{stats.pendingVerifications}</Text>
          <Text style={styles.statLabel}>Pending Verification</Text>
        </GlassCard>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Management Console</Text>
      </View>

      <View style={styles.consoleGrid}>
        <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('UsersManagement')}>
          <Users size={32} color={Colors.primary} />
          <Text style={styles.consoleText}>User List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('HospitalsManagement')}>
          <Hospital size={32} color={Colors.primary} />
          <Text style={styles.consoleText}>Hospital List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('MonitoringScreen')}>
          <Activity size={32} color={Colors.primary} />
          <Text style={styles.consoleText}>Live Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('ReportsScreen')}>
          <BarChart3 size={32} color={Colors.primary} />
          <Text style={styles.consoleText}>System Reports</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(67, 160, 71, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    padding: 20,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  consoleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  consoleTile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  consoleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
});

export default AdminDashboard;
