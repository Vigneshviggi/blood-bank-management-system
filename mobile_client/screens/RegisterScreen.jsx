import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import api from '../services/api';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';

const RegisterScreen = ({ navigation }) => {
  const [role, setRole] = useState('user'); // user or hospital
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    bloodGroup: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (role === 'user' && !formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.location) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = role === 'user' ? '/api/auth/register' : '/api/auth/register-hospital';
      const payload = { ...formData, role };
      const res = await api.post(endpoint, payload);
      
      Alert.alert(
        'Registration Successful',
        'Please verify your email with the OTP sent to you.',
        [{ text: 'OK', onPress: () => navigation.navigate('OTPVerification', { email: formData.email }) }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the LifeLink community</Text>
        </View>

        <View style={styles.roleSelector}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
            onPress={() => setRole('user')}
          >
            <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Donor / User</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'hospital' && styles.roleBtnActive]}
            onPress={() => setRole('hospital')}
          >
            <Text style={[styles.roleText, role === 'hospital' && styles.roleTextActive]}>Hospital</Text>
          </TouchableOpacity>
        </View>

        <GlassCard>
          <Input 
            label={role === 'user' ? "Full Name" : "Hospital Name"}
            placeholder={role === 'user' ? "John Doe" : "City Hospital"}
            value={formData.name}
            onChangeText={(val) => handleChange('name', val)}
            error={errors.name}
          />

          <Input 
            label="Email Address"
            placeholder="example@mail.com"
            value={formData.email}
            onChangeText={(val) => handleChange('email', val)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input 
            label="Phone Number"
            placeholder="+1 234 567 890"
            value={formData.phone}
            onChangeText={(val) => handleChange('phone', val)}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          {role === 'user' && (
            <Input 
              label="Blood Group"
              placeholder="A+, O-, etc."
              value={formData.bloodGroup}
              onChangeText={(val) => handleChange('bloodGroup', val)}
              autoCapitalize="characters"
              error={errors.bloodGroup}
            />
          )}

          <Input 
            label="Location / Address"
            placeholder="City, State"
            value={formData.location}
            onChangeText={(val) => handleChange('location', val)}
            error={errors.location}
          />

          <Input 
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(val) => handleChange('password', val)}
            secureTextEntry
            error={errors.password}
          />

          <Button 
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.regBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.primary,
  },
  regBtn: {
    marginTop: 10,
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
  loginText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default RegisterScreen;
