import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import RequestCard from '../components/RequestCard';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';

const RequestHistoryScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get('/api/requests');
        const history = res.data.filter(req => 
          String(req.requesterId) === String(user._id || user.id) || 
          (req.responses && req.responses.some(resp => String(resp.responderId) === String(user._id || user.id)))
        );
        setRequests(history);
      } catch (err) {
        setRequests([]);
      }
      setLoading(false);
      setRefreshing(false);
    };
    fetchRequests();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(false);
    const res = await api.get('/api/requests');
    const history = res.data.filter(req => 
      String(req.requesterId) === String(user._id || user.id) || 
      (req.responses && req.responses.some(resp => String(resp.responderId) === String(user._id || user.id)))
    );
    setRequests(history);
    setRefreshing(false);
  };

  if (loading) return <LoadingSkeleton height={60} />;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Request History</Text>
          <Text style={styles.subtitle}>Review all requests you created or responded to.</Text>
        </View>
        <Badge label={`${requests.length} Items`} variant="primary" />
      </View>

      <FlatList
        data={requests}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <RequestCard request={item} onPress={() => navigation.navigate('RequestDetails', { request: item })} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No requests found</Text>
            <Text style={styles.emptyText}>Your request history will appear here once you create or answer a request.</Text>
          </GlassCard>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: 24,
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
});

export default RequestHistoryScreen;
