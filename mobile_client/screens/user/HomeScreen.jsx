import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import ScreenContainer from '../../components/ScreenContainer';
import GlassCard from '../../components/ui/GlassCard';
import { Colors } from '../../constants/Theme';
import api from '../../services/api';
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
      const [requestsRes, statsRes] = await Promise.all([
        api.get('/api/requests?limit=3'),
        api.get('/api/users/stats') // Assume this exists or mock it
      ]);
      setRecentRequests(requestsRes.data);
      if (statsRes.data) setStats(statsRes.data);
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
        <Text style={styles.nameText}>{user?.name || 'Hero'}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <View style={styles.profileBadge}>
          <Ionicons name="person" size={24} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <GlassCard style={styles.statCard}>
        <Ionicons name="water" size={24} color={Colors.primary} />
        <Text style={styles.statValue}>{stats.donations}</Text>
        <Text style={styles.statLabel}>Donations</Text>
      </GlassCard>
      <GlassCard style={styles.statCard}>
        <Ionicons name="heart" size={24} color="#E91E63" />
        <Text style={styles.statValue}>{stats.livesSaved}</Text>
        <Text style={styles.statLabel}>Lives Saved</Text>
      </GlassCard>
      <GlassCard style={styles.statCard}>
        <Ionicons name="calendar" size={24} color="#FF9800" />
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
          <Text style={styles.emptyText}>No emergency requests nearby.</Text>
        </GlassCard>
      )}

      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Camps')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="megaphone" size={24} color="#1E88E5" />
          </View>
          <Text style={styles.actionLabel}>Find Camps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}>
          <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}>
            <Ionicons name="medkit" size={24} color="#43A047" />
          </View>
          <Text style={styles.actionLabel}>Donate Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Notifications')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="notifications" size={24} color="#FB8C00" />
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
    fontSize: 16,
    color: Colors.textSecondary,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  profileBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: Colors.textSecondary,
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
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default HomeScreen;
