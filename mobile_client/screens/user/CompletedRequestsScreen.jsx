import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import RequestCard from '../../components/RequestCard';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../constants/Theme';

const CompletedRequestsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCompleted = async () => {
    try {
      const res = await api.get('/requests');
      const allRequests = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      const completedOrOutdated = allRequests.filter((request) => {
        const requiredDate = request.requiredDate || request.dateRequired || request.createdAt;
        const isOutdated = requiredDate ? new Date(requiredDate).setHours(23, 59, 59, 999) < new Date().getTime() : false;
        
        if (request.status === 'Completed' || isOutdated) {
          // If it's just outdated (not explicitly completed), change status for display
          if (isOutdated && request.status !== 'Completed') {
            request.status = 'Outdated';
          }
          return true;
        }
        return false;
      });
      
      setRequests(completedOrOutdated);
    } catch (error) {
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompleted();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompleted();
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Completed Requests</Text>
        <Badge label={`${requests.length} Done`} variant="success" />
      </View>
      <Text style={styles.subtitle}>Requests that were fulfilled or closed after a response.</Text>
    </>
  );

  return (
    <ScreenContainer scrollable={false}>
      {loading ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {renderHeader()}
          <LoadingSkeleton height={120} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <RequestCard request={item} onPress={() => navigation.navigate('RequestDetails', { request: item })} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing completed yet</Text>
              <Text style={styles.emptyText}>Completed requests will appear here once they are closed.</Text>
            </GlassCard>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 18,
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: 26,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  emptyText: {
    marginTop: 8,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
});

export default CompletedRequestsScreen;
