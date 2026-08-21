import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import api from '../services/api';
import { getCurrentCoordinates, LOCATION_ERRORS } from '../services/locationService';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/ui/Badge';
import io from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import * as Clipboard from 'expo-clipboard';

const RADIUS_OPTIONS = [5, 10, 25, 50];
const BLOOD_TYPES = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ─── Blood Group Dropdown ─────────────────────────────────────────────────
const BloodGroupDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBtn}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.dropdownBtnInner}>
          <Text style={styles.dropdownLabel}>🩸 Blood Group</Text>
          <View style={styles.dropdownValueRow}>
            <Text style={styles.dropdownValue}>{value}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.primary} />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Blood Group</Text>
            <FlatList
              data={BLOOD_TYPES}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, item === value && styles.modalOptionActive]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, item === value && styles.modalOptionTextActive]}>
                    {item === 'All' ? '🩸 All Blood Groups' : item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────
const DonorsScreen = ({ navigation }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedBlood, setSelectedBlood] = useState('All');
  const [contactModalDonor, setContactModalDonor] = useState(null);
  const [copiedType, setCopiedType] = useState(null);
  const [locationState, setLocationState] = useState({
    coords: null,
    status: 'idle',
    errorMessage: '',
  });

  const activeRadiusRef = useRef(radiusKm);
  activeRadiusRef.current = radiusKm;

  const activeBloodRef = useRef(selectedBlood);
  activeBloodRef.current = selectedBlood;

  const activeCoordsRef = useRef(locationState.coords);
  activeCoordsRef.current = locationState.coords;

  const fetchNearbyDonors = useCallback(
    async (forcedCoords = null, forcedRadius = null, forcedBlood = null) => {
      const currentRadius = forcedRadius ?? activeRadiusRef.current;
      const currentBlood = forcedBlood ?? activeBloodRef.current;
      let targetCoords = forcedCoords ?? activeCoordsRef.current;

      try {
        if (!targetCoords) {
          setLocationState((prev) => ({ ...prev, status: 'loading', errorMessage: '' }));
          targetCoords = await getCurrentCoordinates();
          setLocationState({ coords: targetCoords, status: 'success', errorMessage: '' });
        }

        let query = `/donors/nearby?latitude=${targetCoords.latitude}&longitude=${targetCoords.longitude}&radius=${currentRadius}&availability=available`;
        if (currentBlood && currentBlood !== 'All') {
          query += `&bloodGroup=${encodeURIComponent(currentBlood)}`;
        }

        const res = await api.get(query);
        const data = Array.isArray(res.data?.donors)
          ? res.data.donors
          : Array.isArray(res.data)
          ? res.data
          : [];
        setDonors(data);
      } catch (err) {
        if (err.code === LOCATION_ERRORS.PERMISSION_DENIED) {
          setLocationState({
            coords: null,
            status: 'permission_denied',
            errorMessage: 'Location permission is required to find nearby donors.',
          });
        } else if (err.code === LOCATION_ERRORS.SERVICE_DISABLED) {
          setLocationState({
            coords: null,
            status: 'service_disabled',
            errorMessage: 'Location services are disabled. Please enable GPS.',
          });
        } else if (
          err.code === LOCATION_ERRORS.POSITION_UNAVAILABLE ||
          err.code === LOCATION_ERRORS.TIMEOUT
        ) {
          setLocationState({
            coords: null,
            status: 'gps_failed',
            errorMessage: 'Unable to determine your location. Please try again.',
          });
        } else {
          setLocationState((prev) => ({
            ...prev,
            status: prev.coords ? 'success' : 'network_error',
            errorMessage: 'Unable to load donors. Please check your connection.',
          }));
        }
        setDonors([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNearbyDonors();
  }, [fetchNearbyDonors]);

  useEffect(() => {
    let socket;
    try {
      const socketUrl = API_BASE_URL.replace('/api', '');
      socket = io(socketUrl, { transports: ['websocket'], reconnection: true });
      const handleUpdate = () => {
        if (activeCoordsRef.current) {
          fetchNearbyDonors(activeCoordsRef.current, activeRadiusRef.current, activeBloodRef.current);
        }
      };
      socket.on('userUpdate', handleUpdate);
      socket.on('donorUpdate', handleUpdate);
    } catch {
      // ignore socket errors
    }
    return () => {
      if (socket) {
        socket.off('userUpdate');
        socket.off('donorUpdate');
        socket.disconnect();
      }
    };
  }, [fetchNearbyDonors]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearbyDonors(activeCoordsRef.current, radiusKm, selectedBlood);
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    setLoading(true);
    fetchNearbyDonors(activeCoordsRef.current, newRadius, selectedBlood);
  };

  const handleBloodChange = (blood) => {
    setSelectedBlood(blood);
    setLoading(true);
    fetchNearbyDonors(activeCoordsRef.current, radiusKm, blood);
  };

  const handleContactDonor = async (donor) => {
    try {
      if (!donor.phone && !donor.email) {
        const res = await api.get(`/donors/${donor._id}/contact`);
        if (res.data?.success) {
          setContactModalDonor({ ...donor, phone: res.data.phone, email: res.data.email });
          return;
        }
      }
      setContactModalDonor(donor);
    } catch (_err) {
      setContactModalDonor(donor);
    }
  };

  const renderDonorCard = ({ item }) => (
    <GlassCard style={styles.donorCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'D'}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.donorName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={12} color={Colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location || 'Local Area'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <Badge label={item.bloodGroup || 'O+'} variant="primary" style={styles.bloodBadge} />
          <Text style={styles.distanceChip}>
            {typeof item.distanceKm === 'number' ? `${item.distanceKm} km` : 'Nearby'}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Donations</Text>
          <Text style={styles.statValue}>{item.donationsCount ?? item.donations ?? 0}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: item.availability ? Colors.success : Colors.textMuted }]}>
            {item.availability ? '✓ Available' : 'Resting'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {typeof item.distanceKm === 'number' ? `${item.distanceKm} km` : '—'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() =>
            navigation.navigate('DonorProfile', {
              userId: item._id,
            })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="person-outline" size={14} color={Colors.text} />
          <Text style={styles.profileBtnText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => handleContactDonor(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={14} color="#FFF" />
          <Text style={styles.contactBtnText}>Contact Donor</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  const renderEmpty = () => {
    if (locationState.status === 'permission_denied') {
      return (
        <View style={styles.centeredContainer}>
          <View style={[styles.errorIconCircle, { backgroundColor: Colors.primarySoft }]}>
            <Ionicons name="location-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.errorTitle}>Location Permission Required</Text>
          <Text style={styles.errorSubtitle}>{locationState.errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchNearbyDonors()}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (locationState.status === 'service_disabled' || locationState.status === 'gps_failed') {
      return (
        <View style={styles.centeredContainer}>
          <View style={[styles.errorIconCircle, { backgroundColor: '#FFF4E5' }]}>
            <Ionicons name="warning-outline" size={32} color={Colors.warning} />
          </View>
          <Text style={styles.errorTitle}>GPS Unavailable</Text>
          <Text style={styles.errorSubtitle}>{locationState.errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchNearbyDonors()}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centeredContainer}>
        <View style={[styles.errorIconCircle, { backgroundColor: '#F1F5F9' }]}>
          <Ionicons name="search-outline" size={32} color={Colors.textSecondary} />
        </View>
        <Text style={styles.errorTitle}>No Donors Nearby</Text>
        <Text style={styles.errorSubtitle}>
          No available donors within {radiusKm} km
          {selectedBlood !== 'All' ? ` for ${selectedBlood}` : ''}.
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, styles.retryBtnOutline]}
          onPress={() => handleRadiusChange(Math.min(50, radiusKm + 15))}
        >
          <Text style={[styles.retryBtnText, { color: Colors.text }]}>Expand Radius</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Available Donors</Text>
          <Text style={styles.headerSubtitle}>
            {locationState.coords ? '📍 Using your real GPS location' : 'Finding donors near you…'}
          </Text>
        </View>
      </View>

      {/* ── Filter Row: Radius + Dropdown side-by-side ── */}
      <View style={styles.filtersRow}>
        <View style={styles.radiusSection}>
          <Text style={styles.filterLabel}>Radius</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusPill, radiusKm === r && styles.radiusPillActive]}
                onPress={() => handleRadiusChange(r)}
                activeOpacity={0.8}
              >
                <Text style={[styles.radiusPillText, radiusKm === r && styles.radiusPillTextActive]}>
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <BloodGroupDropdown value={selectedBlood} onChange={handleBloodChange} />
      </View>

      {/* ── Result count ── */}
      {!loading && donors.length > 0 && (
        <Text style={styles.resultCount}>
          {donors.length} donor{donors.length !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* ── Main Content ── */}
      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding nearby donors…</Text>
          <Text style={styles.loadingSubtext}>Acquiring GPS & querying database</Text>
        </View>
      ) : donors.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={donors}
          keyExtractor={(item) => item._id}
          renderItem={renderDonorCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* ── Contact Donor Modal ── */}
      <Modal
        visible={Boolean(contactModalDonor)}
        transparent
        animationType="slide"
        onRequestClose={() => setContactModalDonor(null)}
      >
        <TouchableOpacity 
          style={styles.contactModalOverlay} 
          activeOpacity={1} 
          onPress={() => setContactModalDonor(null)}
        >
          <View style={styles.contactModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={styles.contactModalHeader}>
              <View style={styles.contactModalAvatar}>
                <Text style={styles.contactModalAvatarText}>
                  {contactModalDonor?.name?.charAt(0)?.toUpperCase() || 'D'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.contactModalName}>{contactModalDonor?.name}</Text>
                <Text style={styles.contactModalSub}>
                  Blood Group: <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{contactModalDonor?.bloodGroup || 'O+'}</Text> • {contactModalDonor?.distanceKm} km away
                </Text>
              </View>
              <TouchableOpacity onPress={() => setContactModalDonor(null)} style={styles.contactModalCloseBtn}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.contactSection}>
              {/* Mobile Phone Card */}
              <View style={styles.contactCardItem}>
                <View style={styles.contactIconCircle}>
                  <Ionicons name="call" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.contactItemLabel}>Mobile Number</Text>
                  <Text style={styles.contactItemValue}>
                    {contactModalDonor?.phone || 'Not available'}
                  </Text>
                </View>
                {contactModalDonor?.phone && (
                  <View style={styles.contactItemActions}>
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={async () => {
                        await Clipboard.setStringAsync(contactModalDonor.phone);
                        setCopiedType('phone');
                        setTimeout(() => setCopiedType(null), 2000);
                        Alert.alert('Copied', 'Phone number copied to clipboard!');
                      }}
                    >
                      <Ionicons name={copiedType === 'phone' ? 'checkmark' : 'copy-outline'} size={13} color={Colors.primary} />
                      <Text style={styles.copyBtnText}>{copiedType === 'phone' ? 'Copied!' : 'Copy'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => Linking.openURL(`tel:${contactModalDonor.phone}`)}
                    >
                      <Ionicons name="call" size={13} color="#FFF" />
                      <Text style={styles.callBtnText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Email Card */}
              <View style={styles.contactCardItem}>
                <View style={[styles.contactIconCircle, { backgroundColor: '#EBF3FF' }]}>
                  <Ionicons name="mail" size={18} color="#2D6CDF" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.contactItemLabel}>Email Address</Text>
                  <Text style={styles.contactItemValue} numberOfLines={1}>
                    {contactModalDonor?.email || `${contactModalDonor?.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com`}
                  </Text>
                </View>
                <View style={styles.contactItemActions}>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={async () => {
                      const emailToCopy = contactModalDonor?.email || `${contactModalDonor?.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
                      await Clipboard.setStringAsync(emailToCopy);
                      setCopiedType('email');
                      setTimeout(() => setCopiedType(null), 2000);
                      Alert.alert('Copied', 'Email address copied to clipboard!');
                    }}
                  >
                    <Ionicons name={copiedType === 'email' ? 'checkmark' : 'copy-outline'} size={13} color={Colors.primary} />
                    <Text style={styles.copyBtnText}>{copiedType === 'email' ? 'Copied!' : 'Copy'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: '#2D6CDF' }]}
                    onPress={() => {
                      const emailToOpen = contactModalDonor?.email || `${contactModalDonor?.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
                      Linking.openURL(`mailto:${emailToOpen}`);
                    }}
                  >
                    <Ionicons name="mail" size={13} color="#FFF" />
                    <Text style={styles.callBtnText}>Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewFullProfileBtn}
              onPress={() => {
                const donorId = contactModalDonor?._id;
                setContactModalDonor(null);
                navigation.navigate('DonorProfile', {
                  userId: donorId,
                });
              }}
            >
              <Ionicons name="person-outline" size={16} color={Colors.primary} />
              <Text style={styles.viewFullProfileBtnText}>View Complete Donor Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // Filters
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 10,
  },
  radiusSection: { flex: 1 },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 4,
  },
  radiusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    color: Colors.text,
  },
  radiusPillTextActive: { color: '#FFF' },

  // Blood Dropdown
  dropdownBtn: {
    minWidth: 110,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownBtnInner: { alignItems: 'center' },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '65%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  modalOptionActive: {
    backgroundColor: Colors.primary + '12',
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },

  // Result count
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    marginLeft: 2,
  },

  // Cards
  listContent: { paddingBottom: 100 },
  donorCard: {
    padding: 16,
    borderRadius: Radius.xl,
    marginBottom: 14,
    ...Shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  headerInfo: { flex: 1 },
  donorName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  bloodBadge: {},
  distanceChip: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  contactBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Shadows.primaryGlow,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },

  // States
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
  },
  retryBtnOutline: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },

  // Contact Donor Modal Styles
  contactModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  contactModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  contactModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactModalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactModalAvatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  contactModalName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  contactModalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactModalCloseBtn: {
    padding: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  contactSection: {
    gap: 12,
    marginBottom: 20,
  },
  contactCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  contactItemValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  contactItemActions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  viewFullProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  viewFullProfileBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default DonorsScreen;
