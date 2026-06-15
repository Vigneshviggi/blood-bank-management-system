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

const MyResponsesScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchResponses = async () => {
    if (!user) return;
    try {
      const res = await api.get('/api/requests');
      const filtered = res.data.filter((request) =>
        request.responses?.some((response) => String(response.responderId) === String(user._id || user.id))
      );
      setRequests(filtered);
    } catch (error) {
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchResponses();
  };

  const renderItem = ({ item }) => {
    const myResponse = item.responses?.find((response) => String(response.responderId) === String(user._id || user.id));

    return (
      <GlassCard style={styles.responseCard}>
        <RequestCard request={item} onPress={() => navigation.navigate('RequestDetails', { request: item })} />
        <View style={styles.responseMeta}>
          <Badge label={`My response: ${myResponse?.status || 'Submitted'}`} variant={myResponse?.status === 'Accepted' ? 'success' : 'info'} />
          <Text style={styles.responseText}>ETA: {myResponse?.eta || 'Not shared'}</Text>
          {myResponse?.note ? <Text style={styles.noteText}>{myResponse.note}</Text> : null}
        </View>
      </GlassCard>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>My Responses</Text>
        <Badge label={`${requests.length} Items`} variant="primary" />
      </View>
      <Text style={styles.subtitle}>Track every blood request you answered and the status of your response.</Text>

      {loading ? (
        <LoadingSkeleton height={120} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No responses yet</Text>
              <Text style={styles.emptyText}>Respond to urgent requests to see them listed here.</Text>
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
  responseCard: {
    padding: 0,
    marginBottom: 16,
  },
  responseMeta: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    marginTop: -4,
  },
  responseText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 6,
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
    paddingBottom: 120,
  },
});

export default MyResponsesScreen;
