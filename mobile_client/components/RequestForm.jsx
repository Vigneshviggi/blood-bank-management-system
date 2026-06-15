import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Picker, ScrollView } from 'react-native';
import EmergencyBadge from '../components/EmergencyBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const emergencyLevels = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

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
      await api.post('/api/requests', { ...form, type });
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Blood Request Form</Text>
      {loading && <LoadingSkeleton height={40} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <Text style={styles.label}>Blood Group *</Text>
      <Picker
        selectedValue={form.bloodGroup}
        onValueChange={v => handleChange('bloodGroup', v)}
        style={styles.input}
      >
        <Picker.Item label="Select blood group" value="" />
        {bloodGroups.map(bg => <Picker.Item key={bg} label={bg} value={bg} />)}
      </Picker>
      <Text style={styles.label}>Units Required *</Text>
      <TextInput
        style={styles.input}
        value={form.units}
        onChangeText={v => handleChange('units', v)}
        keyboardType="numeric"
        placeholder="Units"
      />
      <Text style={styles.label}>Emergency Priority *</Text>
      <Picker
        selectedValue={form.emergencyLevel}
        onValueChange={v => handleChange('emergencyLevel', v)}
        style={styles.input}
      >
        {emergencyLevels.map(e => <Picker.Item key={e.value} label={e.label} value={e.value} />)}
      </Picker>
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
    color: '#e53935',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  submitBtn: {
    backgroundColor: '#e53935',
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
    color: '#e53935',
    marginBottom: 8,
  },
  success: {
    color: '#43a047',
    marginBottom: 8,
  },
});

export default RequestForm;
