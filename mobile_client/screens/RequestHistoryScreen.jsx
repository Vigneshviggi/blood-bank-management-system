import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import RequestCard from '../components/RequestCard';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { AuthContext } from '../context/AuthContext';

const RequestHistoryScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    };
    fetchRequests();
  }, [user]);

  if (loading) return <LoadingSkeleton height={60} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request History</Text>
      <FlatList
        data={requests}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <RequestCard request={item} onPress={() => navigation.navigate('RequestDetails', { request: item })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No requests found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 10,
  },
  empty: {
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default RequestHistoryScreen;
