import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email: initialEmail, otp: initialOtp } = route.params || {};
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState(initialOtp || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !otp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      Alert.alert(
        'Success',
        'Your password has been reset successfully.',
        [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {initialOtp ? 'Please enter your new password below.' : 'Enter the OTP and your new password.'}
          </Text>
        </View>

        <GlassCard>
          {/* Email and OTP are now handled in the background via route params */}

          <Input 
            label="New Password"
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
          />

          <Input 
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
          />

          <Button 
            title="Reset Password"
            onPress={handleReset}
            loading={loading}
            style={styles.btn}
          />
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  btn: {
    marginTop: 10,
  },
});

export default ResetPasswordScreen;
