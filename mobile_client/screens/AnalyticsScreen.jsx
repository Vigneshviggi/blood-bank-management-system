import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import { Info, Heart, Users, Activity, BarChart3 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const AnalyticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Monthly');
  const [trendData, setTrendData] = useState([]);
  const [bloodGroupDemand, setBloodGroupDemand] = useState([]);

  const fetchStats = async () => {
    try {
      const [trendsRes, demandRes] = await Promise.all([
        api.get('/analytics/trends/monthly'),
        api.get('/analytics/demand/blood-groups')
      ]);

      const trends = trendsRes.data?.data || [];
      const demand = demandRes.data?.data || [];
      const totalDonations = trends.reduce((sum, item) => sum + (item.value ?? 0), 0);
      const livesSaved = totalDonations * 3;

      setStats({
        totalDonations,
        livesSaved,
      });
      setTrendData(trends);
      setBloodGroupDemand(demand);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setStats({
        totalDonations: 0,
        livesSaved: 0,
      });
      setTrendData([]);
      setBloodGroupDemand([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading || !stats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer scrollable={false} style={{ paddingHorizontal: 0 }}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Info size={24} color={Colors.text} style={{transform: [{rotate: '180deg'}]}} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Performance Analytics</Text>
        <TouchableOpacity style={styles.infoBtn}>
          <Info size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['Weekly', 'Monthly', 'Yearly'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryIconBox}><Heart size={20} color={Colors.primary} /></View>
            <Text style={styles.summaryValue}>{stats.totalDonations}</Text>
            <Text style={styles.summaryLabel}>Total Donations</Text>
          </View>
          <View style={styles.summaryBox}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#E9F0FE' }]}><Users size={20} color={Colors.accent} /></View>
            <Text style={styles.summaryValue}>{stats.livesSaved}</Text>
            <Text style={styles.summaryLabel}>Lives Saved</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Donation Trends</Text>
            <BarChart3 size={20} color={Colors.textSecondary} />
          </View>
            <View style={styles.trendChart}>
              {trendData.length === 0 ? (
                <Text style={styles.emptyChartText}>No trend data available yet.</Text>
              ) : (
                trendData.map((item) => (
                  <View key={item.month} style={styles.chartBarWrapper}>
                    <View style={[styles.bar, { height: `${Math.max(10, item.value || 0)}%`, backgroundColor: Colors.primary }]} />
                    <Text style={styles.chartLabelText}>{item.month}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Blood Group Demand</Text>
            <View style={styles.demandList}>
              {bloodGroupDemand.length > 0 ? (
                bloodGroupDemand.map((item) => (
                  <View key={item._id} style={styles.demandItem}>
                    <Text style={styles.demandGroup}>{item._id || 'Unknown'}</Text>
                    <Text style={styles.demandValue}>{item.totalRequests || 0} requests</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyChartText}>Demand data not available yet.</Text>
              )}
            </View>
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
    backgroundColor: '#fff',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  infoBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E4E4',
    paddingBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F4EEEC',
  },
  activeTabBtn: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E4E4',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDE7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0E4E4',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholderChart: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  bar: {
    width: 24,
    backgroundColor: '#F0E4E4',
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  chartLabelText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingHorizontal: 8,
  },
  chartBarWrapper: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  emptyChartText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  demandList: {
    marginTop: 16,
  },
  demandItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  demandGroup: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  demandValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#F0E4E4',
  },
});

export default AnalyticsScreen;
