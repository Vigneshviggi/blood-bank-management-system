import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';

const DashboardCard = ({ type, navigation, onPress }) => {
  // Render different cards based on type (emergency, hospitals, donationHistory, camps, inventory, analytics, etc.)
  let title = '';
  let description = '';
  let cta = '';
  let target = null;
  switch (type) {
    case 'emergency':
      title = 'Nearby Emergency Requests';
      description = 'View and respond to urgent blood requests in your area.';
      cta = 'Donate Now';
      target = 'Requests';
      break;
    case 'hospitals':
      title = 'Nearby Hospitals';
      description = 'Find hospitals and their blood inventory.';
      cta = 'Find Hospitals';
      target = 'Home';
      break;
    case 'donationHistory':
      title = 'Donation History';
      description = 'Track your past blood donations and impact.';
      cta = 'View History';
      target = 'RequestHistory';
      break;
    case 'camps':
      title = 'Upcoming Camps';
      description = 'Register for upcoming blood donation camps.';
      cta = 'Register';
      target = 'Camps';
      break;
    case 'inventory':
      title = 'Blood Inventory';
      description = 'Manage and monitor blood stock levels.';
      cta = 'View Inventory';
      break;
    case 'emergencyRequests':
      title = 'Emergency Requests';
      description = 'Create and monitor emergency blood requests.';
      cta = 'Create Request';
      break;
    case 'analytics':
      title = 'Analytics';
      description = 'View analytics and reports.';
      cta = 'View Analytics';
      break;
    case 'users':
      title = 'Users Management';
      description = 'Manage users and permissions.';
      cta = 'Manage Users';
      break;
    case 'monitoring':
      title = 'System Monitoring';
      description = 'Monitor emergency activities and system health.';
      cta = 'Monitor';
      break;
    case 'reports':
      title = 'Reports';
      description = 'View and export system reports.';
      cta = 'View Reports';
      break;
    default:
      title = 'Dashboard';
      description = '';
      cta = '';
  }
  const handlePress = () => {
    if (onPress) {
      onPress(target || type);
      return;
    }

    if (target && navigation) {
      navigation.getParent?.()?.navigate?.(target) || navigation.navigate?.(target);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {cta ? (
          <TouchableOpacity style={styles.ctaBtn} onPress={handlePress} activeOpacity={0.85}>
            <Text style={styles.ctaText}>{cta}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: 16,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  accentBar: {
    width: 6,
    backgroundColor: Colors.primary,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    fontFamily: Typography.heading,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 20,
  },
  ctaBtn: {
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
});

export default DashboardCard;
