import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { Colors, Radius, Typography } from '../constants/Theme';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fingerprint, Droplet } from 'lucide-react-native';

let GoogleSignin = null;
let statusCodes = {};
try {
  const GSignIn = require('@react-native-google-signin/google-signin');
  GoogleSignin = GSignIn.GoogleSignin;
  statusCodes = GSignIn.statusCodes;
  GoogleSignin.configure({
    webClientId: 'your-web-client-id.apps.googleusercontent.com', // Required for ID token
    offlineAccess: false,
  });
} catch (e) {
  console.log('Google Signin native module not found, likely running in Expo Go.');
}

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, googleLogin } = useContext(AuthContext);

  useEffect(() => {
    const checkBiometrics = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const savedToken = await AsyncStorage.getItem('token');
      setIsBiometricSupported(compatible && savedToken !== null);
    };
    checkBiometrics();
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/login', { identifier, password });
      await login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        fallbackLabel: 'Use password',
      });
      if (biometricAuth.success) {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        if (token && user) {
          await login(token, JSON.parse(user));
        } else {
          Alert.alert('Error', 'Session expired. Please log in with password.');
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleGoogleLogin = async () => {
    if (!GoogleSignin) {
      Alert.alert(
        'Not Supported in Expo Go',
        'Google Sign-In requires custom native code. Please build a custom dev client (e.g., npx expo run:android).'
      );
      return;
    }

    setGoogleLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken || userInfo.data?.idToken; // Depends on library version

      const result = await googleLogin(idToken);
      if (!result.success) {
        setError(result.error || 'Google login failed');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play services not available or outdated');
      } else {
        setError('Some other error happened');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Droplet size={28} color="#fff" fill="#fff" />
          </View>
          <Text style={styles.logoText}>Life<Text style={{ color: Colors.primary }}>Link</Text></Text>
          <Text style={styles.subtitle}>Connecting lives, one drop at a time.</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue saving lives</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input
            label="Email or Phone"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          {isBiometricSupported && (
            <Button
              title="Login with Biometrics"
              onPress={handleBiometricLogin}
              variant="ghost"
              style={styles.secondaryBtn}
            />
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleBtnText}>
              {googleLoading ? 'Signing in…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
    fontFamily: Typography.heading,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  card: {
    marginHorizontal: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: Typography.heading,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 22,
    marginTop: 4,
  },
  errorText: {
    color: Colors.error,
    backgroundColor: '#FDECEA',
    padding: 12,
    borderRadius: Radius.sm,
    marginBottom: 16,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  forgotText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  loginBtn: {
    marginTop: 4,
  },
  secondaryBtn: {
    marginTop: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
    marginRight: 10,
  },
  googleBtnText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  signupText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});

export default LoginScreen;
