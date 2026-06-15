import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import RequestCard from '../components/RequestCard';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ResponseModal from '../components/ResponseModal';
import { AuthContext } from '../context/AuthContext';

const RequestDetailsScreen = ({ route, navigation }) => {
  const { request: initialRequest } = route.params;
  const [request, setRequest] = useState(initialRequest);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useContext(AuthContext);

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
      <TouchableOpacity style={styles.respondBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.respondText}>Respond</Text>
      </TouchableOpacity>
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
});

export default RequestDetailsScreen;
