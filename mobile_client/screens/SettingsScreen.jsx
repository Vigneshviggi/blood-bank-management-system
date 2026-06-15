import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';

const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Badge label="Secure" variant="success" />
      </View>
      <Text style={styles.subtitle}>Manage notifications, privacy and security preferences.</Text>

      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Push Notifications</Text>
            <Text style={styles.rowSubtitle}>Blood request alerts and camp updates</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#E4E7EC', true: 'rgba(217,45,32,0.35)' }} thumbColor={pushEnabled ? Colors.primary : '#fff'} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Email Alerts</Text>
            <Text style={styles.rowSubtitle}>Receive receipts and request summaries</Text>
          </View>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#E4E7EC', true: 'rgba(217,45,32,0.35)' }} thumbColor={emailEnabled ? Colors.primary : '#fff'} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Location Sharing</Text>
            <Text style={styles.rowSubtitle}>Show nearby requests and camps</Text>
          </View>
          <Switch value={locationSharing} onValueChange={setLocationSharing} trackColor={{ false: '#E4E7EC', true: 'rgba(217,45,32,0.35)' }} thumbColor={locationSharing ? Colors.primary : '#fff'} />
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionLabel}>Change Password</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionLabel}>Logout All Devices</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 18,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  actionArrow: {
    fontSize: 28,
    color: Colors.textSecondary,
    marginTop: -2,
  },
});

export default SettingsScreen;
