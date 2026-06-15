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
        api.get(`/api/hospitals/${user._id || user.id}`),
        api.get(`/api/requests?requesterId=${user._id || user.id}`),
        api.get(`/api/camps/organized-by/${user._id || user.id}`)
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.welcomeText}>Hospital Portal</Text>
            <Text style={styles.nameText}>{user?.name}</Text>
            <Text style={styles.subtitle}>Manage inventory, blood demand and camp coordination from one command center.</Text>
          </View>
          <Badge label={user?.verified ? 'Verified' : 'Pending'} variant={user?.verified ? 'success' : 'warning'} />
        </View>

        <View style={styles.statsRow}>
          <GlassCard style={styles.statBox}>
            <Activity size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{data.activeRequests}</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </GlassCard>
          <GlassCard style={styles.statBox}>
            <Megaphone size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{data.upcomingCamps}</Text>
            <Text style={styles.statLabel}>My Camps</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <AlertTriangle size={18} color={Colors.warning} />
            <Text style={styles.alertTitle}>Emergency Readiness</Text>
          </View>
          <Text style={styles.alertText}>Keep your stock levels current to reduce response time for high-priority requests.</Text>
        </GlassCard>

        {renderInventorySummary()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Management</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('CreateRequest')}>
            <PlusCircle size={32} color={Colors.primary} />
            <Text style={styles.actionText}>New Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Inventory')}>
            <Beaker size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Stock Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('Camps')}>
            <Megaphone size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Organize Camp</Text>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alertCard: {
    marginBottom: 24,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  alertText: {
    marginTop: 8,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inventoryCard: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  viewMore: {
    color: Colors.primary,
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
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  groupValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  lowStock: {
    color: Colors.primary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionTile: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HospitalDashboard;
