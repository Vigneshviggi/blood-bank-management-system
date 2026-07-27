import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import ScreenContainer from '../components/ScreenContainer';
import { Colors } from '../constants/Theme';
import { Info, Search, Droplet, Megaphone, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Mock data for demo if notifications from backend is empty
  const dummyNotifications = [
    { _id: '1', type: 'blood_request', title: 'New O+ request at Saveetha Hospital', time: '2 mins ago', read: false },
    { _id: '2', type: 'camp_update', title: 'Camp registration confirmed for tomorrow', time: '1 hour ago', read: true },
    { _id: '3', type: 'system', title: 'Your profile has been verified successfully', time: 'Yesterday', read: true },
  ];

  const displayList = notifications.length > 0 ? notifications : dummyNotifications;

  const getIcon = (type) => {
    switch(type) {
      case 'blood_request': return <Droplet size={16} color="#fff" />;
      case 'camp_update': return <Megaphone size={16} color="#fff" />;
      default: return <CheckCircle size={16} color="#fff" />;
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'blood_request': return Colors.primary;
      case 'camp_update': return Colors.accent;
      default: return '#4CAF50';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notificationCard, !item.read && styles.unreadCard]}>
      <View style={[styles.iconCircle, { backgroundColor: getIconBg(item.type) }]}>
        {getIcon(item.type)}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardText} numberOfLines={2}>
          {item.message || item.title}
        </Text>
        <Text style={styles.cardTime}>{item.time || 'Just now'}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={false} style={{ paddingHorizontal: 0 }}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Info size={24} color={Colors.text} style={{transform: [{rotate: '180deg'}]}} />
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  unreadCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFE0E0',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontWeight: '500',
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
