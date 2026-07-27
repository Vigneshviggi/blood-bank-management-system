import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Beaker, Megaphone, PlusCircle, Activity, ChevronRight, AlertTriangle } from 'lucide-react-native';
import Badge from '../components/ui/Badge';

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
      const [hospRes, requestsRes, campsRes] = await Promise.all([
        api.get('/hospitals/profile/me'),
        api.get(`/requests?requesterId=${user._id || user.id}`),
        api.get(`/camps/organized-by/${user._id || user.id}`)
      ]);

      setData({
        inventory: hospRes.data.stock || {},
        activeRequests: requestsRes.data.filter(r => r.status === 'Pending').length,
        upcomingCamps: campsRes.data.length,
        totalDonations: 0 // Assume this is calculated elsewhere
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
          <Text style={styles.logoText}>{user?.name?.toLowerCase() || 'saveetha'} <View style={styles.verifiedDot} /></Text>
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
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('BloodRequests')}>
            <Activity size={28} color={Colors.primary} style={{marginBottom: 8}} />
            <Text style={styles.statValue}>{data.activeRequests}</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Camps')}>
            <Megaphone size={28} color={Colors.accent} style={{marginBottom: 8}} />
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
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('CreateRequest')}>
            <PlusCircle size={24} color={Colors.primary} />
            <Text style={styles.actionText}>New Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Inventory')}>
            <Beaker size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Update Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Camps')}>
            <Megaphone size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Organize Camp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('BloodRequests')}>
            <Activity size={24} color={Colors.textSecondary} />
            <Text style={styles.actionText}>View Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Analytics')}>
            <Activity size={24} color={Colors.textSecondary} />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  verifiedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    marginLeft: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  rightNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rolePill: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  bellBtn: {
    padding: 4,
  },
  header: {
    paddingHorizontal: 20,
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
    backgroundColor: '#fff',
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  alertCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  alertText: {
    marginTop: 6,
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
  },
  inventoryCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  viewMore: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  groupValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  lowStock: {
    color: Colors.warning,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  actionTile: {
    width: '18%',
    alignItems: 'center',
    marginHorizontal: '1%',
    marginBottom: 16,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HospitalDashboard;
