import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';

const OTPVerificationScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { email, otp });
      Alert.alert(
        'Verified!',
        'Your account has been verified. You can now login.',
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/api/auth/forgot-password', { email });
      Alert.alert('Success', 'OTP has been resent to your email.');
    } catch (err) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, justifyContent: 'center'}}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
        </View>

        <GlassCard>
          <Input 
            label="OTP Code"
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.otpInput}
          />

          <Button 
            title="Verify & Continue"
            onPress={handleVerify}
            loading={loading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive the code? </Text>
            <Button 
              variant="outline"
              title="Resend OTP"
              onPress={handleResend}
              style={styles.resendBtn}
            />
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  otpInput: {
    letterSpacing: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  resendBtn: {
    height: 40,
    width: '60%',
  }
});

export default OTPVerificationScreen;
