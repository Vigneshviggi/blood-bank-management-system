import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Users, Hospital, Activity, ShieldCheck, AlertCircle, BarChart3 } from 'lucide-react-native';
import Badge from '../components/ui/Badge';

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
        activeRequests: requests.filter(r => r.status === 'Pending').length,
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
    <ScreenContainer scrollable={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.welcomeText}>System Admin</Text>
            <Text style={styles.nameText}>Platform Overview</Text>
            <Text style={styles.subtitle}>Monitor users, hospitals, requests and safety signals in one place.</Text>
          </View>
          <Badge label="Admin Verified" variant="success" />
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

        <GlassCard style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <ShieldCheck size={20} color={Colors.success} />
            <Text style={styles.heroTitle}>Emergency Monitoring</Text>
          </View>
          <Text style={styles.heroText}>Review system health, hospital verification and demand spikes without leaving the dashboard.</Text>
        </GlassCard>

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

        <View style={{ height: 120 }} />
      </ScrollView>
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
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
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
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
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  heroCard: {
    marginTop: 8,
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  heroText: {
    marginTop: 10,
    color: Colors.textSecondary,
    lineHeight: 20,
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
    padding: 22,
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
