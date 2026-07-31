import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const BloodBankDashboard = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/blood-bank/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Blood Bank Control</Text>
          <Text style={styles.titleText}>{user?.name || 'Central Blood Unit'}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Overview Cards */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Total Units</Text>
            <Text style={styles.statVal}>{stats?.totalUnits || 0}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={[styles.statVal, { color: Colors.success }]}>{stats?.availableUnits || 0}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Expiring Soon</Text>
            <Text style={[styles.statVal, { color: Colors.warning }]}>{stats?.expiringUnits || 0}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>Emergency Req</Text>
            <Text style={[styles.statVal, { color: Colors.error }]}>{stats?.emergencyRequests || 0}</Text>
          </GlassCard>
        </View>

        {/* Stock Matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blood Group Availability</Text>
          <View style={styles.bgGrid}>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
              <View key={bg} style={styles.bgCard}>
                <Text style={styles.bgBadge}>{bg}</Text>
                <Text style={styles.bgCount}>{stats?.stock?.[bg] || 0} Units</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Action Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Operations</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert('Walk-in Collection', 'Use web dashboard or scan barcode to process walk-in donors.')}
              activeOpacity={0.85}
            >
              <Ionicons name="body" size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Walk-in Donor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('QRScanner')}
              activeOpacity={0.85}
            >
              <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Scan Barcode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 8,
    paddingBottom: 22,
    marginHorizontal: -24,
    marginTop: -24,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.glow,
  },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  titleText: { color: '#fff', fontSize: 20, fontWeight: '800', fontFamily: Typography.heading, marginTop: 2 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 24, justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    marginBottom: 12,
    padding: 16,
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
  statVal: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 4 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 14, fontFamily: Typography.heading },
  bgGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  bgCard: {
    width: '23%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    ...Shadows.soft,
  },
  bgBadge: { color: Colors.primary, fontWeight: '900', fontSize: 14 },
  bgCount: { fontSize: 10, color: Colors.textSecondary, marginTop: 4, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.soft,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: Colors.text },
});

export default BloodBankDashboard;
