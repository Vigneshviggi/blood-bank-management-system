import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import ScreenContainer from '../../components/ScreenContainer';
import GlassCard from '../../components/ui/GlassCard';
import { Colors, Radius, Typography } from '../../constants/Theme';
import api from '../../services/api';
import { getCurrentCoordinates } from '../../services/locationService';
import RequestCard from '../../components/RequestCard';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [recentRequests, setRecentRequests] = useState([]);
  const [stats, setStats] = useState({ donations: 0, livesSaved: 0, upcomingCamps: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let requestsPromise;
      try {
        const coords = await getCurrentCoordinates();
        requestsPromise = api.get(`/requests/nearby?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=25`);
      } catch (locErr) {
        // Fallback: without valid location, do not expose distant requests in nearby feed
        requestsPromise = Promise.resolve({ data: { requests: [] } });
      }

      const [requestsRes, statsRes] = await Promise.all([
        requestsPromise,
        api.get('/users/stats'),
      ]);

      const nearbyList = Array.isArray(requestsRes.data?.requests)
        ? requestsRes.data.requests
        : Array.isArray(requestsRes.data)
        ? requestsRes.data
        : [];

      setRecentRequests(nearbyList.slice(0, 3));

      const payload = statsRes.data?.stats || statsRes.data || {};
      setStats({
        donations: payload.donations ?? 0,
        livesSaved: payload.livesSaved ?? 0,
        upcomingCamps: payload.upcomingCamps ?? 0,
      });
    } catch (err) {
      console.error('Error fetching home data', err);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user?.name || 'Loading...'}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
        <View style={styles.profileBadge}>
          <Ionicons name="person" size={22} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <GlassCard style={styles.statCard}>
        <View style={[styles.statIconChip, { backgroundColor: Colors.primarySoft }]}>
          <Ionicons name="water" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.statValue}>{stats.donations}</Text>
        <Text style={styles.statLabel}>Donations</Text>
      </GlassCard>
      <GlassCard style={styles.statCard}>
        <View style={[styles.statIconChip, { backgroundColor: Colors.secondarySoft }]}>
          <Ionicons name="heart" size={20} color={Colors.secondaryDark} />
        </View>
        <Text style={styles.statValue}>{stats.livesSaved}</Text>
        <Text style={styles.statLabel}>Lives Saved</Text>
      </GlassCard>
      <GlassCard style={styles.statCard}>
        <View style={[styles.statIconChip, { backgroundColor: '#FFF1DE' }]}>
          <Ionicons name="calendar" size={20} color={Colors.warning} />
        </View>
        <Text style={styles.statValue}>{stats.upcomingCamps}</Text>
        <Text style={styles.statLabel}>Camps</Text>
      </GlassCard>
    </View>
  );

  return (
    <ScreenContainer scrollable={true}>
      {renderHeader()}
      {renderStats()}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Emergency Requests</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentRequests.length > 0 ? (
        recentRequests.map((item) => (
          <RequestCard
            key={item._id}
            request={item}
            onPress={() => navigation.navigate('RequestDetails', { request: item })}
          />
        ))
      ) : (
        <GlassCard style={styles.emptyCard}>
          <Ionicons name="checkmark-circle-outline" size={28} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No emergency requests nearby.</Text>
        </GlassCard>
      )}

      <View style={[styles.sectionHeader, { marginTop: 28 }]}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('DonorsScreen')} activeOpacity={0.85}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primarySoft }]}>
            <Ionicons name="people" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Find Donors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Camps')} activeOpacity={0.85}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.secondarySoft }]}>
            <Ionicons name="megaphone" size={22} color={Colors.secondaryDark} />
          </View>
          <Text style={styles.actionLabel}>Find Camps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
          <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="medkit" size={22} color="#0284C7" />
          </View>
          <Text style={styles.actionLabel}>Donate Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.85}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF1DE' }]}>
            <Ionicons name="notifications" size={22} color={Colors.warning} />
          </View>
          <Text style={styles.actionLabel}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 14,
  },
  statIconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.textSecondary,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default HomeScreen;
