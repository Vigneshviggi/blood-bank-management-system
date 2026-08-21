import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import api from '../services/api';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { Colors, Radius, Typography } from '../constants/Theme';

const RegisterScreen = ({ navigation }) => {
  const [role, setRole] = useState('donor'); // donor, hospital, blood_bank, volunteer
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    bloodGroup: '',
    location: '',
    registrationNumber: '',
    licenseNumber: ''
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
    if (!formData.name) newErrors.name = 'Name / Org Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if ((role === 'donor' || role === 'volunteer') && !formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }
    if (!formData.location) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = 'users/register';
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        role,
        bloodGroup: role === 'donor' || role === 'volunteer' ? formData.bloodGroup : undefined
      };

      if (!payload.bloodGroup) {
        delete payload.bloodGroup;
      }

      await api.post(endpoint, payload);

      Alert.alert(
        'Check your email',
        'We sent a verification code to your email. Please verify your account before logging in.',
        [{ text: 'Continue', onPress: () => navigation.navigate('OTPVerification', { email: payload.email, mode: 'register' }) }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Registration Failed', err.response?.data?.error || err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Select your role to register on LifeLink</Text>
      </View>

      {/* Role selector */}
      <View style={styles.roleGrid}>
        {[
          { id: 'donor', label: 'Donor' },
          { id: 'hospital', label: 'Hospital' },
          { id: 'blood_bank', label: 'Blood Bank' },
          { id: 'volunteer', label: 'Volunteer' }
        ].map(r => (
          <TouchableOpacity
            key={r.id}
            style={[styles.roleBtn, role === r.id && styles.roleBtnActive]}
            onPress={() => setRole(r.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.roleText, role === r.id && styles.roleTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <GlassCard>
        <Input
          label={role === 'donor' || role === 'volunteer' ? 'Full Name' : role === 'hospital' ? 'Hospital Name' : 'Blood Bank Name'}
          placeholder="Enter name"
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

        {role === 'hospital' && (
          <Input
            label="Hospital Registration Number"
            placeholder="REG-100234"
            value={formData.registrationNumber}
            onChangeText={(val) => handleChange('registrationNumber', val)}
          />
        )}

        {role === 'blood_bank' && (
          <Input
            label="Blood Bank License Number"
            placeholder="LIC-883920"
            value={formData.licenseNumber}
            onChangeText={(val) => handleChange('licenseNumber', val)}
          />
        )}

        {(role === 'donor' || role === 'volunteer') && (
          <Input
            label="Blood Group"
            placeholder="O+, A+, B-, AB+, etc."
            value={formData.bloodGroup}
            onChangeText={(val) => handleChange('bloodGroup', val)}
            autoCapitalize="characters"
            error={errors.bloodGroup}
          />
        )}

        <Input
          label="Location / District"
          placeholder="City, District"
          value={formData.location}
          onChangeText={(val) => handleChange('location', val)}
          error={errors.location}
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(val) => handleChange('password', val)}
          isPassword
          error={errors.password}
        />

        <Button
          title={`Register as ${role.toUpperCase().replace('_', ' ')}`}
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, fontFamily: Typography.heading },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    padding: 5,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  roleBtn: {
    width: '48%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.sm,
    marginBottom: 5,
  },
  roleBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  roleText: { fontWeight: '700', color: Colors.textSecondary, fontSize: 13 },
  roleTextActive: { color: Colors.primary, fontWeight: '800' },
  regBtn: { marginTop: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  loginText: { color: Colors.primary, fontWeight: '800', fontSize: 14 },
});

export default RegisterScreen;
