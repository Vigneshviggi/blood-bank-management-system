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
import { Colors } from '../constants/Theme';
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Blood Bank Control</Text>
          <Text style={styles.titleText}>{user?.name || 'Central Blood Unit'}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Overview Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Units</Text>
          <Text style={styles.statVal}>{stats?.totalUnits || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={[styles.statVal, { color: Colors.success }]}>{stats?.availableUnits || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Expiring Soon</Text>
          <Text style={[styles.statVal, { color: Colors.warning }]}>{stats?.expiringUnits || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Emergency Req</Text>
          <Text style={[styles.statVal, { color: Colors.danger }]}>{stats?.emergencyRequests || 0}</Text>
        </View>
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
          >
            <Ionicons name="body" size={22} color={Colors.primary} />
            <Text style={styles.actionText}>Walk-in Donor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Ionicons name="qr-code-outline" size={22} color={Colors.primary} />
            <Text style={styles.actionText}>Scan Barcode</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#DC2626',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcomeText: { color: '#FEE2E2', fontSize: 12, fontWeight: '600' },
  titleText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2
  },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  statVal: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  bgGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  bgCard: {
    width: '23%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  bgBadge: { color: '#DC2626', fontWeight: '900', fontSize: 14 },
  bgCount: { fontSize: 10, color: '#475569', marginTop: 4, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  actionText: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' }
});

export default BloodBankDashboard;
