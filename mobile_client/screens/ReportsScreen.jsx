import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { ChevronLeft, Download, TrendingUp, Users, Hospital } from 'lucide-react-native';

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    completionRate: 0,
    byBloodGroup: {},
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      const requests = res.data || [];
      const completed = requests.filter((r) => r.status === 'Completed').length;
      const pending = requests.filter((r) => r.status === 'Pending').length;
      const byBloodGroup = requests.reduce((acc, r) => {
        const key = r.bloodGroup || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setReport({
        totalRequests: requests.length,
        completedRequests: completed,
        pendingRequests: pending,
        completionRate: requests.length ? Math.round((completed / requests.length) * 100) : 0,
        byBloodGroup,
      });
    } catch (err) {
      console.error('Error building report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Hook this up to a real export endpoint / share sheet when the backend supports it.
    Alert.alert('Export Report', 'Report export will be emailed to your registered admin address shortly.');
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
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={20} color={Colors.text} />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>System Reports</Text>
            <Text style={styles.subtitle}>Request throughput and blood-group demand across the platform.</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Download size={16} color="#fff" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <GlassCard style={styles.statBox}>
            <TrendingUp size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{report.totalRequests}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </GlassCard>
          <GlassCard style={styles.statBox}>
            <Users size={22} color={Colors.success} />
            <Text style={styles.statValue}>{report.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Status Breakdown</Text>
          <View style={styles.statusRow}>
            <Badge label={`${report.completedRequests} Completed`} variant="success" />
            <Badge label={`${report.pendingRequests} Pending`} variant="warning" />
          </View>
        </GlassCard>

        <GlassCard style={styles.breakdownCard}>
          <View style={styles.sectionHeaderRow}>
            <Hospital size={18} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Demand by Blood Group</Text>
          </View>
          {Object.keys(report.byBloodGroup).length === 0 ? (
            <Text style={styles.emptyText}>No request data available yet.</Text>
          ) : (
            Object.entries(report.byBloodGroup)
              .sort((a, b) => b[1] - a[1])
              .map(([group, count]) => (
                <View key={group} style={styles.groupRow}>
                  <Text style={styles.groupLabel}>{group}</Text>
                  <View style={styles.groupBarTrack}>
                    <View
                      style={[
                        styles.groupBarFill,
                        { width: `${Math.min(100, (count / report.totalRequests) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.groupCount}>{count}</Text>
                </View>
              ))
          )}
        </GlassCard>

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
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exportText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 18,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  breakdownCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupLabel: {
    width: 40,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  groupBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  groupBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  groupCount: {
    width: 24,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

export default ReportsScreen;
