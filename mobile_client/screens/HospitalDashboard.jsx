import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';
import api from '../services/api';
import { Beaker, Megaphone, PlusCircle, Activity, AlertTriangle } from 'lucide-react-native';

const HospitalDashboard = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({
    inventory: {},
    activeRequests: 0,
    upcomingCamps: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/hospitals/dashboard/stats');
      const payload = res.data || {};

      setData({
        inventory: payload.availabilitySummary || {},
        activeRequests: payload.activeRequests ?? 0,
        upcomingCamps: payload.upcomingCamps ?? 0,
        totalDonations: payload.fulfilledRequests ?? 0
      });
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const renderInventorySummary = () => {
    const groups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
    return (
      <GlassCard style={styles.inventoryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Inventory Summary</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
            <Text style={styles.viewMore}>Manage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inventoryGrid}>
          {groups.map(g => (
            <View key={g} style={styles.inventoryItem}>
              <Text style={styles.groupLabel}>{g}</Text>
              <Text style={[styles.groupValue, (data.inventory[g] || 0) < 5 && styles.lowStock]}>
                {data.inventory[g] || 0}
              </Text>
            </View>
          ))}
        </View>
      </GlassCard>
    );
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
      <View style={styles.topNav}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>{user?.name?.toLowerCase() || 'saveetha'}</Text>
          <View style={styles.verifiedDot} />
        </View>
        <View style={styles.rightNav}>
          <View style={styles.rolePill}><Text style={styles.roleText}>Hospital</Text></View>
          <TouchableOpacity style={styles.bellBtn}>
            <Activity size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>Manage inventory, blood demand and camp coordination from one command center.</Text>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('BloodRequests')} activeOpacity={0.85}>
            <View style={[styles.statIconChip, { backgroundColor: Colors.primarySoft }]}>
              <Activity size={22} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{data.activeRequests}</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Camps')} activeOpacity={0.85}>
            <View style={[styles.statIconChip, { backgroundColor: '#E9F0FE' }]}>
              <Megaphone size={22} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{data.upcomingCamps}</Text>
            <Text style={styles.statLabel}>My Camps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <AlertTriangle size={18} color={Colors.primary} />
            <Text style={styles.alertTitle}>Emergency Readiness</Text>
          </View>
          <Text style={styles.alertText}>Keep your stock levels current to reduce response time for high-priority requests.</Text>
        </View>

        {renderInventorySummary()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Management</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('CreateRequest')} activeOpacity={0.85}>
            <View style={styles.actionIconChip}><PlusCircle size={22} color={Colors.primary} /></View>
            <Text style={styles.actionText}>New Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Inventory')} activeOpacity={0.85}>
            <View style={styles.actionIconChip}><Beaker size={22} color={Colors.primary} /></View>
            <Text style={styles.actionText}>Update Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Camps')} activeOpacity={0.85}>
            <View style={styles.actionIconChip}><Megaphone size={22} color={Colors.primary} /></View>
            <Text style={styles.actionText}>Organize Camp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('BloodRequests')} activeOpacity={0.85}>
            <View style={styles.actionIconChip}><Activity size={22} color={Colors.textSecondary} /></View>
            <Text style={styles.actionText}>View Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Analytics')} activeOpacity={0.85}>
            <View style={styles.actionIconChip}><Activity size={22} color={Colors.textSecondary} /></View>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
    textTransform: 'capitalize',
  },
  verifiedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    marginLeft: 6,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  rightNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rolePill: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  bellBtn: {
    padding: 4,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: Radius.lg,
    ...Shadows.soft,
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
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  alertCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.primarySoft,
    padding: 16,
    borderRadius: Radius.md,
    marginBottom: 24,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  alertText: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  inventoryCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  viewMore: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  groupValue: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.primary,
  },
  lowStock: {
    color: Colors.warning,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  actionTile: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconChip: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HospitalDashboard;
