import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import { BellOff, Filter } from 'lucide-react-native';
import NotificationCard from '../components/NotificationCard';
import Badge from '../components/ui/Badge';

const NotificationScreen = () => {
  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !(notification.read || notification.isRead);
    return notification.type === filter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notification Center</Text>
          <Text style={styles.subtitle}>Live alerts, request updates, camp notices and system messages</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={refreshNotifications}>
          <Filter size={16} color={Colors.primary} />
          <Text style={styles.markAll}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <Badge label={`Unread ${unreadCount}`} variant={unreadCount > 0 ? 'primary' : 'neutral'} />
        <Badge label={`${notifications.length} Total`} variant="info" />
        <Badge label="Critical Alerts" variant="warning" />
      </View>

      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'blood_request', label: 'Requests' },
          { key: 'camp_update', label: 'Camps' },
          { key: 'system', label: 'System' },
        ].map((item) => {
          const active = filter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => !(item.read || item.isRead) && markAsRead(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BellOff size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>You’ll see request alerts, camp updates and system messages here.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
  },
  markAll: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 130,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default NotificationScreen;

