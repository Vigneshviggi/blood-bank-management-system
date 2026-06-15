import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import RequestCard from '../components/RequestCard';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ResponseModal from '../components/ResponseModal';
import { AuthContext } from '../context/AuthContext';
import Badge from '../components/ui/Badge';

const RequestDetailsScreen = ({ route, navigation }) => {
  const { request: initialRequest } = route.params;
  const [request, setRequest] = useState(initialRequest);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const currentUserId = String(user?._id || user?.id || '');
  const userResponse = request.responses?.find((response) => String(response.responderId) === currentUserId);
  const hasResponded = Boolean(userResponse);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/requests/${request._id}`);
      setRequest(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleRespond = async (response) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post(`/api/requests/${request._id}/respond`, {
        ...response,
        responderId: user._id || user.id,
        responderName: user.name || 'Anonymous Donor'
      });
      await fetchRequest();
      setModalVisible(false);
      Alert.alert('Success', 'Response submitted successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit response');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  if (loading) return <LoadingSkeleton height={60} />;

  return (
    <View style={styles.container}>
      <RequestCard request={request} />
      {hasResponded ? (
        <View style={styles.submittedCard}>
          <Badge label="Response Submitted" variant="success" />
          <Text style={styles.submittedText}>You already responded to this request.</Text>
          <Text style={styles.submittedMeta}>Status: {userResponse?.status || 'Submitted'} {userResponse?.eta ? `• ETA ${userResponse.eta} min` : ''}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.respondBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.respondText}>Respond</Text>
        </TouchableOpacity>
      )}
      <ResponseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRespond}
        request={request}
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
  respondBtn: {
    backgroundColor: '#e53935',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  respondText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submittedCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(3, 152, 85, 0.08)',
    gap: 8,
  },
  submittedText: {
    color: '#1D2939',
    fontSize: 15,
    fontWeight: '700',
  },
  submittedMeta: {
    color: '#667085',
    fontSize: 13,
  },
});

export default RequestDetailsScreen;
