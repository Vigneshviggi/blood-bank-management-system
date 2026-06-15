import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardCard = ({ type }) => {
  // Render different cards based on type (emergency, hospitals, donationHistory, camps, inventory, analytics, etc.)
  let title = '';
  let description = '';
  let cta = '';
  switch (type) {
    case 'emergency':
      title = 'Nearby Emergency Requests';
      description = 'View and respond to urgent blood requests in your area.';
      cta = 'Donate Now';
      break;
    case 'hospitals':
      title = 'Nearby Hospitals';
      description = 'Find hospitals and their blood inventory.';
      cta = 'Find Hospitals';
      break;
    case 'donationHistory':
      title = 'Donation History';
      description = 'Track your past blood donations and impact.';
      cta = 'View History';
      break;
    case 'camps':
      title = 'Upcoming Camps';
      description = 'Register for upcoming blood donation camps.';
      cta = 'Register';
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
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {cta ? (
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>{cta}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginBottom: 12,
  },
  ctaBtn: {
    backgroundColor: '#e53935',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default DashboardCard;
