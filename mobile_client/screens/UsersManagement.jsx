import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors, Radius, Shadows } from '../constants/Theme';
import api from '../services/api';
import {
  Search,
  Users as UsersIcon,
  Mail,
  Droplets,
  UserX,
  UserCheck,
  ChevronRight,
} from 'lucide-react-native';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'donor', label: 'Donors' },
  { key: 'hospital', label: 'Hospitals' },
  { key: 'admin', label: 'Admins' },
];

const roleColor = (role) => {
  if (role === 'hospital') return Colors.accent || '#2E90FA';
  if (role === 'admin') return Colors.error || '#D92D20';
  return Colors.success || '#039855'; // donor / user
};

const UserCard = ({ user, onToggleActive }) => {
  const isActive = user.active !== false;
  const initial = (user.name || '?').charAt(0).toUpperCase();
  const accent = roleColor(user.role);

  return (
    <GlassCard style={styles.card} flat>
      <View style={[styles.accentBar, { backgroundColor: isActive ? accent : Colors.textMuted }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: `${accent}1F` }]}>
            <Text style={[styles.avatarText, { color: accent }]}>{initial}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name} numberOfLines={1}>{user.name || 'Unnamed User'}</Text>
            <View style={styles.emailRow}>
              <Mail size={12} color={Colors.textSecondary} />
              <Text style={styles.emailText} numberOfLines={1}>{user.email}</Text>
            </View>
          </View>

          <Badge label={user.role || 'user'} variant={user.role === 'hospital' ? 'info' : user.role === 'admin' ? 'primary' : 'success'} />
        </View>

        <View style={styles.metaRow}>
          {user.bloodGroup ? (
            <View style={styles.metaChip}>
              <Droplets size={11} color={Colors.primary} />
              <Text style={[styles.metaChipText, { color: Colors.primary, fontWeight: '800' }]}>{user.bloodGroup}</Text>
            </View>
          ) : null}
          {user.location ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText} numberOfLines={1}>{user.location}</Text>
            </View>
          ) : null}
          {!isActive ? (
            <View style={[styles.metaChip, styles.deactivatedChip]}>
              <Text style={[styles.metaChipText, { color: Colors.textMuted }]}>Deactivated</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.actionsRow}>
          {isActive ? (
            <TouchableOpacity style={styles.deactivateBtn} onPress={() => onToggleActive(user, false)} activeOpacity={0.85}>
              <UserX size={16} color={Colors.error} />
              <Text style={styles.deactivateText}>Deactivate</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.reactivateBtn} onPress={() => onToggleActive(user, true)} activeOpacity={0.85}>
              <UserCheck size={16} color="#fff" />
              <Text style={styles.reactivateText}>Reactivate</Text>
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

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleActive = (user, makeActive) => {
    if (makeActive) {
      updateActive(user, true);
      return;
    }
    Alert.alert(
      'Deactivate User',
      `${user.name || 'This user'} will lose access until reactivated. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => updateActive(user, false) },
      ]
    );
  };

  const updateActive = async (user, active) => {
    try {
      await api.put(`/api/users/${user._id}`, { active });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, active } : u)));
    } catch (err) {
      Alert.alert('Error', 'Failed to update this account');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filter !== 'all') {
        const role = u.role === 'user' ? 'donor' : u.role;
        if (role !== filter) return false;
      }
      if (!query.trim()) return true;
      const haystack = `${u.name || ''} ${u.email || ''} ${u.bloodGroup || ''}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [users, filter, query]);

  const donorCount = users.filter((u) => u.role === 'user' || u.role === 'donor').length;
  const activeCount = users.filter((u) => u.active !== false).length;

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Users</Text>
          <Text style={styles.heroSubtitle}>Manage donor accounts and platform access.</Text>
        </View>
        <View style={styles.heroIcon}>
          <UsersIcon size={22} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statPillValue}>{users.length}</Text>
          <Text style={styles.statPillLabel}>Total</Text>
        </View>
        <View style={[styles.statPill, styles.statPillSuccess]}>
          <Text style={[styles.statPillValue, { color: Colors.success }]}>{donorCount}</Text>
          <Text style={styles.statPillLabel}>Donors</Text>
        </View>
        <View style={[styles.statPill, styles.statPillInfo]}>
          <Text style={[styles.statPillValue, { color: Colors.accent || '#2E90FA' }]}>{activeCount}</Text>
          <Text style={styles.statPillLabel}>Active</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email or blood group"
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
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          renderItem={({ item }) => <UserCard user={item} onToggleActive={handleToggleActive} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <UsersIcon size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No users found</Text>
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
  statPillInfo: {
    backgroundColor: 'rgba(46, 144, 250, 0.06)',
    borderColor: 'rgba(46, 144, 250, 0.2)',
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
    flexWrap: 'wrap',
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
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  emailText: {
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
  deactivatedChip: {
    backgroundColor: 'rgba(152, 162, 179, 0.15)',
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
  deactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  deactivateText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 13,
  },
  reactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reactivateText: {
    color: '#fff',
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

export default UsersManagement;
