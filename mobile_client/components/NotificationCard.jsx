import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from './ui/GlassCard';
import { Colors } from '../constants/Theme';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';

const NotificationCard = ({ notification, onPress }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'emergency': return <AlertTriangle size={20} color={Colors.error} />;
      case 'success': return <CheckCircle size={20} color={Colors.success} />;
      case 'info': return <Info size={20} color={Colors.accent} />;
      default: return <Bell size={20} color={Colors.primary} />;
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <GlassCard style={[styles.card, !(notification.read || notification.isRead) && styles.unread]}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.body}>{notification.message || notification.body}</Text>
          <View style={styles.footer}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.time}>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
        {!(notification.read || notification.isRead) && <View style={styles.unreadDot} />}
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  unread: {
    backgroundColor: 'rgba(229, 57, 53, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default NotificationCard;

