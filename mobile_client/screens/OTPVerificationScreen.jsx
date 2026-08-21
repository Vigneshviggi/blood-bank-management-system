import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import api from '../services/api';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';

const OTPVerificationScreen = ({ navigation, route }) => {
  const { email, mode = 'reset' } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/auth/verify-email' : '/auth/verify-otp';
      await api.post(endpoint, { email, otp });

      if (mode === 'register') {
        Alert.alert(
          'Email verified!',
          'Your account is now active. You can sign in.',
          [{ text: 'Continue', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert(
          'Verified!',
          'Your OTP is valid. You can now reset your password.',
          [{ text: 'Continue', onPress: () => navigation.navigate('ResetPassword', { email, otp }) }]
        );
      }
    } catch (err) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const endpoint = mode === 'register' ? '/auth/resend-verification' : '/auth/resend-reset-otp';
      await api.post(endpoint, { email });
      Alert.alert('Success', 'A new verification code has been sent to your email.');
    } catch (err) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <ScreenContainer>
      <View style={{flex: 1, justifyContent: 'center', minHeight: 400}}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
        </View>

        <GlassCard>
          <View style={styles.otpWrapper}>
            <View style={styles.otpContainer}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxFocused]}>
                  <Text style={styles.otpText}>{otp[i] || ''}</Text>
                </View>
              ))}
            </View>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.hiddenInput}
              autoFocus
            />
          </View>

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
      </View>
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
  otpWrapper: {
    position: 'relative',
    marginBottom: 30,
    marginTop: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E0D3D3',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF7F6',
  },
  otpBoxFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
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
