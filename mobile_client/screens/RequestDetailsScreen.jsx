import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import RequestCard from '../components/RequestCard';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ResponseModal from '../components/ResponseModal';
import { AuthContext } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import { SafeAreaView } from 'react-native-safe-area-context';

const RequestDetailsScreen = ({ route, navigation }) => {
  const { request: initialRequest } = route.params;
  const [request, setRequest] = useState(initialRequest);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const currentUserId = String(user?._id || user?.id || '');
  const userResponse = request.responses?.find((response) => String(response.responderId) === currentUserId);
  const acceptedResponse = request.responses?.find((response) => String(response.status || '').toLowerCase() === 'accepted');
  const hasResponded = Boolean(userResponse);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${request._id}`);
      setRequest(res.data);
    } catch (err) {
      console.error('Failed to refresh request details', err);
    }
    setLoading(false);
  };

  const openDirections = async () => {
    const latitude = Number(request.latitude ?? request.coordinates?.coordinates?.[1] ?? 0);
    const longitude = Number(request.longitude ?? request.coordinates?.coordinates?.[0] ?? 0);

    if (!latitude || !longitude) {
      Alert.alert('Directions unavailable', 'This request does not have a valid destination coordinate yet.');
      return;
    }

    const googleMapsUrl = Platform.OS === 'ios'
      ? `maps://?daddr=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    const canOpen = await Linking.canOpenURL(googleMapsUrl);
    if (canOpen) {
      await Linking.openURL(googleMapsUrl);
    } else {
      Alert.alert('Unable to open maps', 'Install a maps app to open directions.');
    }
  };

  const handleRespond = async (response) => {
    if (!user) return;
    setLoading(true);
    setModalVisible(false); // Close immediately for snappier UI
    try {
      await api.post(`/requests/${request._id}/respond`, {
        ...response,
        responderId: user._id || user.id,
        responderName: user.name || 'Anonymous Donor'
      });
      await fetchRequest(); // Refresh the data to hide the button
      Alert.alert('Success', 'Response submitted successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  if (loading) return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <LoadingSkeleton height={60} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <RequestCard request={request} />
      {acceptedResponse ? (
        <View style={styles.acceptedCard}>
          <Badge label="Donor Accepted" variant="success" />
          <Text style={styles.submittedText}>{acceptedResponse.responderName || 'A donor'} is on the way.</Text>
          <Text style={styles.submittedMeta}>ETA: {acceptedResponse.eta || 'Pending'} min</Text>
          <TouchableOpacity style={styles.routeBtn} onPress={openDirections}>
            <Text style={styles.routeText}>Open Directions</Text>
          </TouchableOpacity>
        </View>
      ) : null}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  respondBtn: {
    backgroundColor: '#C81E4A',
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
  acceptedCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(3, 152, 85, 0.08)',
    gap: 8,
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
  routeBtn: {
    backgroundColor: '#C81E4A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  routeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default RequestDetailsScreen;
