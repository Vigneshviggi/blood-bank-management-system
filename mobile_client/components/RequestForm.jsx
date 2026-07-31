import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import EmergencyBadge from '../components/EmergencyBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const emergencyLevels = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
const bloodGroupOptions = bloodGroups.map((group) => ({ label: group, value: group }));


const RequestForm = ({ onSuccess, type }) => {
  const [form, setForm] = useState({
    bloodGroup: '',
    units: '',
    emergencyLevel: 'medium',
    patientCondition: '',
    hospital: '',
    location: '',
    contact: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    // Validation
    if (!form.bloodGroup || !form.units || !form.emergencyLevel || !form.location || !form.contact) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }
    try {
      await api.post('/requests', { ...form, type });
      setSuccess('Request submitted successfully!');
      setForm({
        bloodGroup: '',
        units: '',
        emergencyLevel: 'medium',
        patientCondition: '',
        hospital: '',
        location: '',
        contact: '',
        notes: '',
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to submit request.');
    }
    setLoading(false);
  };

  const renderOptionSelector = (options, selectedValue, onChange) => (
    <View style={styles.optionGroup}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionChip, isSelected && styles.optionChipActive]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Blood Request Form</Text>
      {loading && <LoadingSkeleton height={40} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <Text style={styles.label}>Blood Group *</Text>
      {renderOptionSelector(bloodGroupOptions, form.bloodGroup, (value) => handleChange('bloodGroup', value))}
      <Text style={styles.label}>Units Required *</Text>
      <TextInput
        style={styles.input}
        value={form.units}
        onChangeText={v => handleChange('units', v)}
        keyboardType="numeric"
        placeholder="Units"
      />
      <Text style={styles.label}>Emergency Priority *</Text>
      {renderOptionSelector(emergencyLevels, form.emergencyLevel, (value) => handleChange('emergencyLevel', value))}
      <EmergencyBadge level={form.emergencyLevel} />
      <Text style={styles.label}>Patient Condition</Text>
      <TextInput
        style={styles.input}
        value={form.patientCondition}
        onChangeText={v => handleChange('patientCondition', v)}
        placeholder="Patient condition"
      />
      <Text style={styles.label}>Hospital Name</Text>
      <TextInput
        style={styles.input}
        value={form.hospital}
        onChangeText={v => handleChange('hospital', v)}
        placeholder="Hospital name"
      />
      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={v => handleChange('location', v)}
        placeholder="Location"
      />
      <Text style={styles.label}>Contact Information *</Text>
      <TextInput
        style={styles.input}
        value={form.contact}
        onChangeText={v => handleChange('contact', v)}
        placeholder="Contact info"
      />
      <Text style={styles.label}>Additional Notes</Text>
      <TextInput
        style={styles.input}
        value={form.notes}
        onChangeText={v => handleChange('notes', v)}
        placeholder="Notes"
      />
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    margin: 12,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C81E4A',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    color: '#1D1B20',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0D3D3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FBF7F6',
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: '#E0D3D3',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  optionChipActive: {
    backgroundColor: '#C81E4A',
    borderColor: '#C81E4A',
  },
  optionText: {
    color: '#1D1B20',
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#FFF',
  },
  submitBtn: {
    backgroundColor: '#C81E4A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#C81E4A',
    marginBottom: 8,
  },
  success: {
    color: '#0E9F6E',
    marginBottom: 8,
  },
});

export default RequestForm;
