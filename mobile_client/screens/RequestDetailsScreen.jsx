import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import RequestCard from '../components/RequestCard';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ResponseModal from '../components/ResponseModal';
import { AuthContext } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';
import ScreenHeader from '../components/ScreenHeader';

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
  
  const isRequester = 
    String(request.requesterId?._id || request.requesterId) === currentUserId || 
    (request.hospitalId && String(request.hospitalId?._id || request.hospitalId) === currentUserId);

  const isExpired = request.requiredBefore 
    ? new Date(request.requiredBefore).getTime() <= new Date().getTime() 
    : false;

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

    let destination = '';

    if (latitude !== 0 && longitude !== 0 && !isNaN(latitude) && !isNaN(longitude)) {
      destination = `${latitude},${longitude}`;
    } else if (request.location && request.location.trim() !== '') {
      destination = encodeURIComponent(request.location);
    } else if (request.hospitalId && request.hospitalId.address) {
      destination = encodeURIComponent(request.hospitalId.address);
    } else {
      Alert.alert('Directions unavailable', 'This request does not have a valid destination coordinate or address yet.');
      return;
    }

    const googleMapsUrl = Platform.OS === 'ios'
      ? `maps://?daddr=${destination}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

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
    try {
      await api.post(`/requests/${request._id}/respond`, {
        ...response,
        responderId: user._id || user.id,
        responderName: user.name || 'Anonymous Donor'
      });
      await fetchRequest(); // Refresh the data to hide the button
      setModalVisible(false);
      
      if (response.status === 'Rejected') {
        Alert.alert('Response Rejected', 'You have declined this request.');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Response accepted successfully.');
        navigation.goBack();
      }
    } catch (err) {
      setModalVisible(false);
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  if (loading) return (
    <View style={styles.safeArea}>
      <ScreenHeader title="Request Details" />
      <LoadingSkeleton height={60} />
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <ScreenHeader title="Request Details" />
      <View style={styles.container}>
        <RequestCard request={request} />
      {isRequester ? (
        <View style={styles.submittedCard}>
          <Badge label="Your Request" variant="success" />
          <Text style={styles.submittedText}>You created this blood request.</Text>
          <Text style={styles.submittedMeta}>Status: {request.status}</Text>
          {acceptedResponse && (
            <Text style={[styles.submittedMeta, { marginTop: 4, color: Colors.primary, fontWeight: '600' }]}>
              Accepted by: {acceptedResponse.responderName || 'A donor'}
            </Text>
          )}
        </View>
      ) : acceptedResponse || ['Accepted', 'Completed'].includes(request.status) ? (
        <View style={styles.acceptedCard}>
          <Badge label="Request Accepted" variant="success" />
          <Text style={styles.submittedText}>This blood request has been accepted.</Text>
          <Text style={styles.submittedMeta}>Status: {request.status}</Text>
          {String(acceptedResponse?.responderId) === currentUserId && (
            <TouchableOpacity style={styles.routeBtn} onPress={openDirections}>
              <Text style={styles.routeText}>Open Directions</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : hasResponded ? (
        <View style={styles.submittedCard}>
          <Badge label="Response Submitted" variant="success" />
          <Text style={styles.submittedText}>You already responded to this request.</Text>
          <Text style={styles.submittedMeta}>Status: {userResponse?.status || 'Submitted'} {userResponse?.eta ? `• ETA ${userResponse.eta} min` : ''}</Text>
        </View>
      ) : isRequester ? (
        <View style={styles.submittedCard}>
          <Badge label="Your Request" variant="neutral" />
          <Text style={styles.submittedText}>You created this blood request.</Text>
          <Text style={styles.submittedMeta}>Status: {request.status || 'Pending'} • {request.responses?.length || 0} Responses received</Text>
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
        submitting={loading}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  expiredCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 68, 56, 0.08)',
    gap: 8,
  },
  expiredText: {
    color: '#1D2939',
    fontSize: 15,
    fontWeight: '700',
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
