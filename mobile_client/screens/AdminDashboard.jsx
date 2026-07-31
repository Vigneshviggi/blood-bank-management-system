import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';
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
      const res = await api.get('/admin/system-stats');
      const payload = res.data || {};

      setStats({
        totalUsers: payload.totalDonors ?? payload.totalUsers ?? 0,
        totalHospitals: payload.totalHospitals ?? 0,
        pendingVerifications: payload.pendingVerifications ?? 0,
        activeRequests: payload.totalRequests ?? 0,
        totalDonations: payload.totalDonations ?? 0
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
            <View style={[styles.statIconChip, { backgroundColor: '#E9F0FE' }]}>
              <Users size={20} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Donors</Text>
          </GlassCard>
          <GlassCard style={styles.statBox}>
            <View style={[styles.statIconChip, { backgroundColor: Colors.primarySoft }]}>
              <Hospital size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalHospitals}</Text>
            <Text style={styles.statLabel}>Hospitals</Text>
          </GlassCard>
        </View>

        <View style={styles.statsGrid}>
          <GlassCard style={styles.statBox}>
            <View style={[styles.statIconChip, { backgroundColor: '#FFF1DE' }]}>
              <Activity size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.activeRequests}</Text>
            <Text style={styles.statLabel}>Live Requests</Text>
          </GlassCard>
          <GlassCard style={styles.statBox}>
            <View style={[styles.statIconChip, { backgroundColor: '#FDECEA' }]}>
              <AlertCircle size={20} color={Colors.error} />
            </View>
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
          <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('UsersManagement')} activeOpacity={0.85}>
            <View style={styles.consoleIconChip}><Users size={26} color={Colors.primary} /></View>
            <Text style={styles.consoleText}>User List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('HospitalsManagement')} activeOpacity={0.85}>
            <View style={styles.consoleIconChip}><Hospital size={26} color={Colors.primary} /></View>
            <Text style={styles.consoleText}>Hospital List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('MonitoringScreen')} activeOpacity={0.85}>
            <View style={styles.consoleIconChip}><Activity size={26} color={Colors.primary} /></View>
            <Text style={styles.consoleText}>Live Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.consoleTile} onPress={() => navigation.navigate('ReportsScreen')} activeOpacity={0.85}>
            <View style={styles.consoleIconChip}><BarChart3 size={26} color={Colors.primary} /></View>
            <Text style={styles.consoleText}>System Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 23,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
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
    padding: 18,
  },
  statIconChip: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  heroCard: {
    marginTop: 8,
    marginBottom: 20,
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
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  consoleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  consoleTile: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.soft,
  },
  consoleIconChip: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consoleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
});

export default AdminDashboard;
