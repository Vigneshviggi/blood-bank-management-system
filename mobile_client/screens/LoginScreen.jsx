import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fingerprint } from 'lucide-react-native';

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
        // Here we ideally fetch the stored token or user credentials and re-authenticate.
        // For simplicity, we assume if the token is valid, we just re-hydrate context.
        // In a real app, you might want to call a /me endpoint to refresh the token/user.
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        if (token && user) {
          await login(token, JSON.parse(user));
        } else {
          Alert.alert("Error", "Session expired. Please log in with password.");
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
          <Text style={styles.logoText}>Life<Text style={{color: Colors.primary}}>Link</Text></Text>
          <Text style={styles.subtitle}>Connecting lives, one drop at a time.</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input 
            label="Email or Phone"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input 
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
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
            <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricLogin}>
              <Fingerprint size={24} color={Colors.primary} />
              <Text style={styles.biometricText}>Login with Biometrics</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={googleLoading}>
            <Text style={styles.googleBtnText}>{googleLoading ? 'Signing in...' : 'Continue with Google'}</Text>
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
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  card: {
    marginHorizontal: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    marginTop: 4,
  },
  errorText: {
    color: Colors.error,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 13,
    textAlign: 'center',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  loginBtn: {
    marginTop: 10,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  biometricText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  googleBtnText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
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
    fontWeight: '700',
    fontSize: 14,
  },
});

export default LoginScreen;
