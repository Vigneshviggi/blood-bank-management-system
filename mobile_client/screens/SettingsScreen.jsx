import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors, Typography } from '../constants/Theme';
import ChangePasswordModal from '../components/ChangePasswordModal';

const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const trackColor = { false: Colors.border, true: 'rgba(200,30,74,0.35)' };
  const thumbColor = (val) => (val ? Colors.primary : '#fff');

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
          <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={trackColor} thumbColor={thumbColor(pushEnabled)} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Email Alerts</Text>
            <Text style={styles.rowSubtitle}>Receive receipts and request summaries</Text>
          </View>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={trackColor} thumbColor={thumbColor(emailEnabled)} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Location Sharing</Text>
            <Text style={styles.rowSubtitle}>Show nearby requests and camps</Text>
          </View>
          <Switch value={locationSharing} onValueChange={setLocationSharing} trackColor={trackColor} thumbColor={thumbColor(locationSharing)} />
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.rowSubtitle}>The app uses the standard light theme only.</Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.actionRow} onPress={() => setIsPasswordModalVisible(true)} activeOpacity={0.85}>
          <Text style={styles.actionLabel}>Change Password</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionRow} activeOpacity={0.85}>
          <Text style={styles.actionLabel}>Logout All Devices</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </GlassCard>

      <ChangePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setIsPasswordModalVisible(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
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
    marginBottom: 20,
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
    fontSize: 26,
    color: Colors.textMuted,
    marginTop: -2,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  themeOptionActive: {
    backgroundColor: Colors.surfaceSoft,
  },
  themeOptionText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '700',
  },
  themeOptionTextActive: {
    color: Colors.primary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
});

export default SettingsScreen;
