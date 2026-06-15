import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from './ui/GlassCard';
import { Colors } from '../constants/Theme';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';
import Badge from './ui/Badge';

const NotificationCard = ({ notification, onPress }) => {
  const isRead = Boolean(notification.read || notification.isRead);

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
      <GlassCard style={[styles.card, !isRead && styles.unread]}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{notification.title}</Text>
            {!isRead && <Badge label="Unread" variant="primary" />}
          </View>
          <Text style={styles.body}>{notification.message || notification.body}</Text>
          <View style={styles.footer}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.time}>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
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
});

export default NotificationCard;

