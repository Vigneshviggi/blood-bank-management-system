import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import ScreenContainer from '../components/ScreenContainer';
import { Colors, Radius, Shadows } from '../constants/Theme';
import { ChevronLeft, Search, Droplet, Megaphone, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import EmptyStateView from '../components/EmptyStateView';

const timeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const NotificationScreen = () => {
  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const displayList = notifications || [];

  const getIcon = (type) => {
    switch (type) {
      case 'blood_request': return <Droplet size={16} color="#fff" />;
      case 'camp_update': return <Megaphone size={16} color="#fff" />;
      default: return <CheckCircle size={16} color="#fff" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'blood_request': return Colors.primary;
      case 'camp_update': return Colors.accent;
      default: return Colors.secondary;
    }
  };

  const handlePress = (item) => {
    if (!item.isRead && markAsRead) {
      markAsRead(item._id);
    }
    if (item.type === 'blood_request' && item.payload?.requestId) {
      navigation.navigate('RequestDetails', { request: { _id: item.payload.requestId } });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]} 
      activeOpacity={0.85}
      onPress={() => handlePress(item)}
    >
      <View style={[styles.iconCircle, { backgroundColor: getIconBg(item.type) }]}>
        {getIcon(item.type)}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>
          {item.message || item.title}
        </Text>
        <Text style={styles.cardTime}>{timeAgo(item.createdAt || item.time)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={false} style={{ paddingHorizontal: 0 }}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Alerts</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayList}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <EmptyStateView title="No notifications" message="You're all caught up. Check back later for updates." />
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  searchBtn: {
    padding: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: Radius.md,
    marginBottom: 12,
    ...Shadows.soft,
  },
  unreadCard: {
    backgroundColor: Colors.primarySoft,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  cardTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});

export default NotificationScreen;
