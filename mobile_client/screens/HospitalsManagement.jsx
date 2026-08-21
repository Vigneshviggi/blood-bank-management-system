import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors, Radius, Shadows } from '../constants/Theme';
import api from '../services/api';
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  MapPin,
  Search,
  Building2,
  Phone,
  ChevronRight,
} from 'lucide-react-native';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
];

const HospitalCard = ({ hospital, onVerify, onRevoke }) => {
  const isVerified = Boolean(hospital.verified);
  const initial = (hospital.name || '?').charAt(0).toUpperCase();
  const stockTotal = hospital.stock
    ? Object.values(hospital.stock).reduce((sum, n) => sum + (Number(n) || 0), 0)
    : null;

  return (
    <GlassCard style={styles.card} flat>
      <View style={[styles.accentBar, { backgroundColor: isVerified ? Colors.success : Colors.warning }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: isVerified ? 'rgba(3,152,85,0.12)' : 'rgba(220,104,3,0.12)' }]}>
            <Text style={[styles.avatarText, { color: isVerified ? Colors.success : Colors.warning }]}>{initial}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.hospitalName} numberOfLines={1}>{hospital.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>{hospital.location || 'No location on file'}</Text>
            </View>
          </View>

          <Badge label={isVerified ? 'Verified' : 'Pending'} variant={isVerified ? 'success' : 'warning'} />
        </View>

        <View style={styles.metaRow}>
          {hospital.phone ? (
            <View style={styles.metaChip}>
              <Phone size={11} color={Colors.textSecondary} />
              <Text style={styles.metaChipText} numberOfLines={1}>{hospital.phone}</Text>
            </View>
          ) : null}
          {stockTotal !== null ? (
            <View style={styles.metaChip}>
              <Building2 size={11} color={Colors.textSecondary} />
              <Text style={styles.metaChipText}>{stockTotal} units in stock</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.actionsRow}>
          {!isVerified ? (
            <TouchableOpacity style={styles.verifyBtn} onPress={() => onVerify(hospital)} activeOpacity={0.85}>
              <ShieldCheck size={16} color="#fff" />
              <Text style={styles.verifyText}>Verify Hospital</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.revokeBtn} onPress={() => onRevoke(hospital)} activeOpacity={0.85}>
              <ShieldX size={16} color={Colors.error} />
              <Text style={styles.revokeText}>Revoke</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.7}>
            <Text style={styles.detailsText}>Details</Text>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
};

const HospitalsManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/api/hospitals');
      setHospitals(res.data || []);
    } catch (err) {
      console.error('Error fetching hospitals', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHospitals();
  };

  const handleVerify = (hospital) => {
    Alert.alert('Verify Hospital', `Confirm ${hospital.name} as a verified partner?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Verify', onPress: () => updateVerification(hospital, true) },
    ]);
  };

  const handleRevoke = (hospital) => {
    Alert.alert('Revoke Verification', `${hospital.name} will no longer appear as a verified hospital. Continue?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => updateVerification(hospital, false) },
    ]);
  };

  const updateVerification = async (hospital, verified) => {
    try {
      await api.put(`/api/hospitals/${hospital._id}`, { verified });
      setHospitals((prev) => prev.map((h) => (h._id === hospital._id ? { ...h, verified } : h)));
    } catch (err) {
      Alert.alert('Error', 'Failed to update verification status');
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      if (filter === 'verified' && !h.verified) return false;
      if (filter === 'pending' && h.verified) return false;
      if (!query.trim()) return true;
      const haystack = `${h.name || ''} ${h.location || ''}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [hospitals, filter, query]);

  const verifiedCount = hospitals.filter((h) => h.verified).length;
  const pendingCount = hospitals.length - verifiedCount;

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Hospitals</Text>
          <Text style={styles.heroSubtitle}>Verify partner hospitals and monitor their standing.</Text>
        </View>
        <View style={styles.heroIcon}>
          <Building2 size={22} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statPillValue}>{hospitals.length}</Text>
          <Text style={styles.statPillLabel}>Total</Text>
        </View>
        <View style={[styles.statPill, styles.statPillSuccess]}>
          <Text style={[styles.statPillValue, { color: Colors.success }]}>{verifiedCount}</Text>
          <Text style={styles.statPillLabel}>Verified</Text>
        </View>
        <View style={[styles.statPill, styles.statPillWarning]}>
          <Text style={[styles.statPillValue, { color: Colors.warning }]}>{pendingCount}</Text>
          <Text style={styles.statPillLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location"
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterBtn, filter === option.key && styles.filterBtnActive]}
            onPress={() => setFilter(option.key)}
          >
            <Text style={[styles.filterText, filter === option.key && styles.filterTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          renderItem={({ item }) => (
            <HospitalCard hospital={item} onVerify={handleVerify} onRevoke={handleRevoke} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <ShieldAlert size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No hospitals found</Text>
              <Text style={styles.emptyText}>
                {query ? 'Try a different search term.' : 'Nothing matches this filter yet.'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 18,
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
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  heroSubtitle: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 45, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statPillSuccess: {
    backgroundColor: 'rgba(3, 152, 85, 0.06)',
    borderColor: 'rgba(3, 152, 85, 0.2)',
  },
  statPillWarning: {
    backgroundColor: 'rgba(220, 104, 3, 0.06)',
    borderColor: 'rgba(220, 104, 3, 0.2)',
  },
  statPillValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statPillLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    padding: 0,
    marginBottom: 14,
    overflow: 'hidden',
  },
  accentBar: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  verifyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  revokeText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 13,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 2,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 120,
  },
});

export default HospitalsManagement;
