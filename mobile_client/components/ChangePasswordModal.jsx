import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './ui/Input';
import Button from './ui/Button';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export default function ChangePasswordModal({ visible, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Your password has been changed successfully.',
      });
      handleClose();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.response?.data?.error || 'Failed to change password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Change Password</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input 
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />

          <Input 
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Input 
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button 
            title="Update Password" 
            onPress={handleSubmit} 
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    width: '100%',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  errorText: {
    color: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    overflow: 'hidden',
  },
  submitBtn: {
    marginTop: 10,
  },
});
