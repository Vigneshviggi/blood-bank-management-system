import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import RequestCard from '../../components/RequestCard';
import api from '../../services/api';
import { getCurrentCoordinates, LOCATION_ERRORS } from '../../services/locationService';
import { Colors, Radius, Shadows, Typography } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../../components/ui/Badge';
import io from 'socket.io-client';
import { API_BASE_URL } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

const RADIUS_OPTIONS = [5, 10, 25, 50];

const RequestsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [locationState, setLocationState] = useState({
    coords: null,
    status: 'idle', // 'idle' | 'loading' | 'success' | 'permission_denied' | 'service_disabled' | 'gps_failed' | 'network_error'
    errorMessage: '',
  });

  const activeRadiusRef = useRef(radiusKm);
  activeRadiusRef.current = radiusKm;

  const activeCoordsRef = useRef(locationState.coords);
  activeCoordsRef.current = locationState.coords;

  const fetchNearby = useCallback(async (forcedCoords = null, forcedRadius = null) => {
    const currentRadius = forcedRadius ?? activeRadiusRef.current;
    let targetCoords = forcedCoords ?? activeCoordsRef.current;

    try {
      if (!targetCoords) {
        setLocationState(prev => ({ ...prev, status: 'loading', errorMessage: '' }));
        targetCoords = await getCurrentCoordinates();
        setLocationState({
          coords: targetCoords,
          status: 'success',
          errorMessage: '',
        });
      }

      const res = await api.get(`/requests/nearby?latitude=${targetCoords.latitude}&longitude=${targetCoords.longitude}&radius=${currentRadius}`);
      const data = Array.isArray(res.data?.requests)
        ? res.data.requests
        : Array.isArray(res.data)
        ? res.data
        : [];
      
      const currentUserId = (user?._id || user?.id)?.toString();
      const filtered = data.filter(r => {
        const creatorId = (r.requesterId?._id || r.requesterId)?.toString();
        return !creatorId || !currentUserId || creatorId !== currentUserId;
      });
      setRequests(filtered);
    } catch (err) {
      if (err.code === LOCATION_ERRORS.PERMISSION_DENIED) {
        setLocationState({
          coords: null,
          status: 'permission_denied',
          errorMessage: 'Location permission is required to find nearby blood requests.',
        });
      } else if (err.code === LOCATION_ERRORS.SERVICE_DISABLED) {
        setLocationState({
          coords: null,
          status: 'service_disabled',
          errorMessage: 'Location services are disabled. Please enable GPS to find nearby requests.',
        });
      } else if (err.code === LOCATION_ERRORS.POSITION_UNAVAILABLE || err.code === LOCATION_ERRORS.TIMEOUT) {
        setLocationState({
          coords: null,
          status: 'gps_failed',
          errorMessage: 'Unable to determine your current location.',
        });
      } else {
        setLocationState(prev => ({
          ...prev,
          status: 'network_error',
          errorMessage: 'Unable to load nearby blood requests. Please try again.',
        }));
      }
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNearby(null, radiusKm);
  }, [radiusKm, fetchNearby]);

  // Socket listener: Re-evaluate against nearby feed on updates
  useEffect(() => {
    let socket;
    try {
      const socketUrl = API_BASE_URL.replace(/\/api\/?$/, '');
      socket = io(socketUrl, { transports: ['websocket', 'polling'] });
      
      const handleRequestChange = () => {
        if (activeCoordsRef.current) {
          fetchNearby(activeCoordsRef.current, activeRadiusRef.current);
        }
      };

      socket.on('newBloodRequest', handleRequestChange);
      socket.on('requestUpdate', handleRequestChange);
    } catch (e) {
      console.log('Socket init error', e);
    }

    return () => {
      if (socket) {
        socket.off('newBloodRequest');
        socket.off('requestUpdate');
        socket.disconnect();
      }
    };
  }, [fetchNearby]);

  const onRefresh = () => {
    setRefreshing(true);
    // Force re-reading GPS coordinates
    fetchNearby(null, radiusKm);
  };

  const handleRetryLocation = () => {
    setLoading(true);
    fetchNearby(null, radiusKm);
  };

  const renderRadiusSelector = () => (
    <View style={styles.radiusContainer}>
      <Text style={styles.radiusLabel}>Radius:</Text>
      <View style={styles.radiusPills}>
        {RADIUS_OPTIONS.map((r) => {
          const isSelected = radiusKm === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.radiusPill, isSelected && styles.radiusPillActive]}
              onPress={() => setRadiusKm(r)}
              activeOpacity={0.85}
            >
              <Text style={[styles.radiusPillText, isSelected && styles.radiusPillTextActive]}>
                {r} km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateTitle}>Finding blood requests near you...</Text>
          <Text style={styles.stateSubtitle}>Acquiring real GPS coordinates</Text>
        </View>
      );
    }

    if (locationState.status === 'permission_denied') {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="location-outline" size={48} color={Colors.primary} style={{ marginBottom: 12 }} />
          <Text style={styles.stateTitle}>Location Permission Required</Text>
          <Text style={styles.stateSubtitle}>Location permission is required to find nearby blood requests.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetryLocation} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (locationState.status === 'service_disabled' || locationState.status === 'gps_failed') {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="navigate-outline" size={48} color={Colors.warning} style={{ marginBottom: 12 }} />
          <Text style={styles.stateTitle}>GPS Unavailable</Text>
          <Text style={styles.stateSubtitle}>Unable to determine your current location.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetryLocation} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (locationState.status === 'network_error') {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={styles.stateTitle}>Connection Error</Text>
          <Text style={styles.stateSubtitle}>Unable to load nearby blood requests. Please try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetryLocation} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onRespond={() => navigation.navigate('RequestDetails', { request: item })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={42} color={Colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Requests Nearby</Text>
            <Text style={styles.emptySubtitle}>No active blood requests found within {radiusKm} km.</Text>
          </View>
        }
        contentContainerStyle={[styles.listContent, requests.length === 0 && { flex: 1 }]}
      />
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Nearby Requests</Text>
          <Text style={styles.heroSubtitle}>Live emergency blood requests within your immediate area.</Text>
        </View>
        <Badge label={`${requests.length} Nearby`} variant="primary" />
      </View>

      <TouchableOpacity
        style={styles.newRequestBtn}
        onPress={() => navigation.navigate('BloodRequest')}
        activeOpacity={0.9}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.newRequestBtnText}>Request Blood</Text>
      </TouchableOpacity>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickChip} onPress={() => navigation.navigate('MyResponses')} activeOpacity={0.85}>
          <Ionicons name="chatbubbles-outline" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.quickChipText}>My Responses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickChip, { marginRight: 0 }]} onPress={() => navigation.navigate('CompletedRequests')} activeOpacity={0.85}>
          <Ionicons name="checkmark-done-circle-outline" size={18} color={Colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.quickChipText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {renderRadiusSelector()}

      {renderContent()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 4,
  },
  radiusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  radiusPills: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radiusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  radiusPillTextActive: {
    color: '#fff',
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.soft,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  newRequestBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: Radius.md,
    marginBottom: 16,
    ...Shadows.glow,
  },
  newRequestBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  quickRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  quickChip: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  quickChipText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  stateSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default RequestsScreen;
