import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Heart, Users, Info, BarChart3 } from 'lucide-react-native';

const PERIODS = ['Weekly', 'Monthly', 'Yearly'];
const COLUMN_WIDTH = 42; // fixed per-bar width so labels can never collide

const buildBuckets = (requests, period) => {
  const now = new Date();

  if (period === 'Weekly') {
    return Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - idx));
      const count = requests.filter((r) => {
        const created = new Date(r.createdAt || 0);
        return created.toDateString() === day.toDateString();
      }).length;
      return { label: day.toLocaleDateString(undefined, { weekday: 'short' }), count };
    });
  }

  if (period === 'Yearly') {
    return Array.from({ length: 5 }).map((_, idx) => {
      const year = now.getFullYear() - (4 - idx);
      const count = requests.filter((r) => new Date(r.createdAt || 0).getFullYear() === year).length;
      return { label: String(year), count };
    });
  }

  // Monthly: full 12-month calendar year — this is the set that used to overlap.
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames.map((label, idx) => {
    const count = requests.filter((r) => {
      const created = new Date(r.createdAt || 0);
      return created.getMonth() === idx && created.getFullYear() === now.getFullYear();
    }).length;
    return { label, count };
  });
};

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Weekly');
  const [requests, setRequests] = useState([]);
  const [byBloodGroup, setByBloodGroup] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/requests');
      const data = res.data || [];
      setRequests(data);
      setByBloodGroup(
        data.reduce((acc, r) => {
          const key = r.bloodGroup || 'Unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      );
    } catch (err) {
      console.error('Error loading analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const completedRequests = requests.filter((r) => r.status === 'Completed');
  const totalDonations = completedRequests.length;
  const livesSaved = totalDonations * 3; // one donation can help up to 3 patients

  const buckets = useMemo(() => buildBuckets(requests, period), [requests, period]);
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  const sortedGroups = Object.entries(byBloodGroup).sort((a, b) => b[1] - a[1]);
  const maxGroupCount = Math.max(1, ...sortedGroups.map(([, c]) => c));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Analytics</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('About this data', 'Figures are calculated live from request records — donations are approximated from completed requests.')}
        >
          <Info size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <GlassCard style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(217, 45, 32, 0.1)' }]}>
            <Heart size={18} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{totalDonations}</Text>
          <Text style={styles.statLabel}>Total Donations</Text>
        </GlassCard>
        <GlassCard style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(46, 144, 250, 0.1)' }]}>
            <Users size={18} color={Colors.accent} />
          </View>
          <Text style={styles.statValue}>{livesSaved}</Text>
          <Text style={styles.statLabel}>Lives Saved</Text>
        </GlassCard>
      </View>

      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.sectionTitle}>Donation Trends</Text>
          <BarChart3 size={18} color={Colors.textSecondary} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContent}
        >
          {buckets.map((bucket) => (
            <View key={bucket.label} style={styles.chartColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${Math.max(4, (bucket.count / maxCount) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>{bucket.label}</Text>
            </View>
          ))}
        </ScrollView>
      </GlassCard>

      <GlassCard style={styles.demandCard}>
        <Text style={styles.sectionTitle}>Blood Group Demand</Text>
        {sortedGroups.length === 0 ? (
          <Text style={styles.emptyText}>No request data yet.</Text>
        ) : (
          sortedGroups.map(([group, count], idx) => (
            <View key={group} style={[styles.demandRow, idx === sortedGroups.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.demandLabel}>{group}</Text>
              <View style={styles.demandBarTrack}>
                <View style={[styles.demandBarFill, { width: `${(count / maxGroupCount) * 100}%` }]} />
              </View>
              <Text style={styles.demandCount}>{count} requests</Text>
            </View>
          ))
        )}
      </GlassCard>

      <View style={{ height: 40 }} />
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
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartCard: {
    marginBottom: 16,
    paddingBottom: 12,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  // Fixed-width columns inside a horizontal scroller: this is what actually
  // prevents label overlap, no matter how many buckets (7, 12, or 5) render.
  chartScrollContent: {
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  chartColumn: {
    width: COLUMN_WIDTH,
    alignItems: 'center',
  },
  barTrack: {
    width: 14,
    height: 110,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  demandCard: {
    marginBottom: 8,
  },
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  demandLabel: {
    width: 64,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  demandBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  demandBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  demandCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    width: 78,
    textAlign: 'right',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    paddingVertical: 8,
  },
});

export default AnalyticsScreen;
