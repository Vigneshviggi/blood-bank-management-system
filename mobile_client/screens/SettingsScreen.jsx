import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Colors, Typography } from '../constants/Theme';
import ScreenHeader from '../components/ScreenHeader';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useContext(AuthContext);

  const [pushEnabled, setPushEnabled] = useState(user?.preferences?.pushNotifications ?? true);
  const [emailEnabled, setEmailEnabled] = useState(user?.preferences?.emailAlerts ?? true);
  const [locationSharing, setLocationSharing] = useState(user?.preferences?.locationSharing ?? true);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Sync state if user context updates from another source
  useEffect(() => {
    if (user?.preferences) {
      setPushEnabled(user.preferences.pushNotifications ?? true);
      setEmailEnabled(user.preferences.emailAlerts ?? true);
      setLocationSharing(user.preferences.locationSharing ?? true);
    }
  }, [user]);

  const updatePreference = async (key, value) => {
    // Optimistic UI Update
    if (key === 'pushNotifications') setPushEnabled(value);
    if (key === 'emailAlerts') setEmailEnabled(value);
    if (key === 'locationSharing') setLocationSharing(value);

    try {
      const payload = {
        pushNotifications: key === 'pushNotifications' ? value : pushEnabled,
        emailAlerts: key === 'emailAlerts' ? value : emailEnabled,
        locationSharing: key === 'locationSharing' ? value : locationSharing,
      };

      const res = await api.put('/users/preferences', payload);
      if (res.data.success && updateUser) {
        updateUser({ ...user, preferences: res.data.preferences });
      }
    } catch (error) {
      // Revert UI on failure
      if (key === 'pushNotifications') setPushEnabled(!value);
      if (key === 'emailAlerts') setEmailEnabled(!value);
      if (key === 'locationSharing') setLocationSharing(!value);
      
      Alert.alert('Error', 'Could not update preference. Please try again.');
    }
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      'Logout All Devices',
      'This will log you out from all currently active sessions on all devices. You will need to log in again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout All', 
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOutAll(true);
            try {
              await api.post('/users/logout-all');
              await logout();
            } catch (err) {
              Alert.alert('Error', 'Failed to logout from all devices.');
              setIsLoggingOutAll(false);
            }
          }
        }
      ]
    );
  };

  const trackColor = { false: Colors.border, true: 'rgba(200,30,74,0.35)' };
  const thumbColor = (val) => (val ? Colors.primary : '#fff');

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      <ScreenHeader 
        title="Settings" 
        rightAction={<Badge label="Secure" variant="success" />} 
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <Text style={styles.subtitle}>Manage notifications, privacy and security preferences.</Text>

        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSubtitle}>Blood request alerts and camp updates</Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={(v) => updatePreference('pushNotifications', v)} 
              trackColor={trackColor} 
              thumbColor={thumbColor(pushEnabled)} 
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Email Alerts</Text>
              <Text style={styles.rowSubtitle}>Receive receipts and request summaries</Text>
            </View>
            <Switch 
              value={emailEnabled} 
              onValueChange={(v) => updatePreference('emailAlerts', v)} 
              trackColor={trackColor} 
              thumbColor={thumbColor(emailEnabled)} 
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Location Sharing</Text>
              <Text style={styles.rowSubtitle}>Show nearby requests and camps</Text>
            </View>
            <Switch 
              value={locationSharing} 
              onValueChange={(v) => updatePreference('locationSharing', v)} 
              trackColor={trackColor} 
              thumbColor={thumbColor(locationSharing)} 
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity 
            style={styles.actionRow} 
            onPress={() => setIsPasswordModalVisible(true)} 
            activeOpacity={0.7}
          >
            <Text style={styles.actionLabel}>Change Password</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.actionRow} 
            onPress={handleLogoutAllDevices}
            activeOpacity={0.7}
            disabled={isLoggingOutAll}
          >
            <Text style={[styles.actionLabel, { color: Colors.primary }]}>
              {isLoggingOutAll ? 'Logging out...' : 'Logout All Devices'}
            </Text>
            {isLoggingOutAll ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.actionArrow, { color: Colors.primary }]}>›</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        <ChangePasswordModal
          visible={isPasswordModalVisible}
          onClose={() => setIsPasswordModalVisible(false)}
        />
        <View style={{ height: 60 }} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 20, // Aligned with the cards
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    fontFamily: Typography.heading,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 8,
  },
  rowText: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  actionArrow: {
    fontSize: 24,
    color: Colors.textMuted,
    lineHeight: 24,
    marginTop: -2,
  },
});

export default SettingsScreen;
