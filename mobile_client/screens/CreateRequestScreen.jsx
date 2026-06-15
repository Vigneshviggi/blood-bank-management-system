import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { ChevronLeft, Send, AlertCircle } from 'lucide-react-native';

const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const priorityLevels = ['normal', 'urgent', 'critical'];

const CreateRequestScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    units: '',
    location: user?.location || '',
    emergencyLevel: 'normal',
    contactNumber: user?.phone || '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.bloodGroup || !formData.units) {
      Alert.alert('Error', 'Please fill in blood group and units.');
      return;
    }

    setLoading(true);
    try {
      const emergencyLevelMap = {
        normal: 'Normal',
        urgent: 'High',
        critical: 'Critical',
      };
      const payload = {
        requesterType: 'hospital',
        requesterId: user?._id || user?.id,
        requesterTypeModel: 'User',
        targetType: 'person',
        bloodGroup: formData.bloodGroup,
        unitsNeeded: Number(formData.units),
        emergencyLevel: emergencyLevelMap[formData.emergencyLevel] || 'Normal',
        patientCondition: '',
        hospitalId: null,
        location: formData.location,
        contactInfo: formData.contactNumber,
        reason: formData.reason,
      };
      await api.post('/api/requests', payload);
      Alert.alert('Success', 'Blood request created and broadcasted to nearby donors.');
      navigation.goBack();
    } catch (err) {
      console.error('Error creating request', err);
      Alert.alert('Error', 'Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Blood Request</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.label}>Blood Group Required *</Text>
          <View style={styles.groupContainer}>
            {bloodGroups.map(group => (
              <TouchableOpacity 
                key={group}
                style={[styles.groupChip, formData.bloodGroup === group && styles.activeChip]}
                onPress={() => setFormData({...formData, bloodGroup: group})}
              >
                <Text style={[styles.chipText, formData.bloodGroup === group && styles.activeChipText]}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 8}}>
              <Text style={styles.label}>Units Required *</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. 2"
                keyboardType="number-pad"
                value={formData.units}
                onChangeText={(val) => setFormData({...formData, units: val})}
              />
            </View>
          </View>

          <Text style={styles.label}>Emergency Level</Text>
          <View style={styles.priorityContainer}>
            {priorityLevels.map(level => (
              <TouchableOpacity 
                key={level}
                style={[styles.priorityBtn, formData.emergencyLevel === level && styles[`priority_${level}`]]}
                onPress={() => setFormData({...formData, emergencyLevel: level})}
              >
                <Text style={[styles.priorityText, formData.emergencyLevel === level && styles.activePriorityText]}>
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Hospital Location</Text>
          <TextInput 
            style={styles.input}
            placeholder="City, Area"
            value={formData.location}
            onChangeText={(val) => setFormData({...formData, location: val})}
          />

          <Text style={styles.label}>Reason for Request</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Brief details about the emergency..."
            multiline
            numberOfLines={4}
            value={formData.reason}
            onChangeText={(val) => setFormData({...formData, reason: val})}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Broadcast Request</Text>
              </>
            )}
          </TouchableOpacity>
        </GlassCard>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  card: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  groupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  groupChip: {
    width: '23%',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    alignItems: 'center',
    margin: 4,
  },
  activeChip: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  activeChipText: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priority_normal: { backgroundColor: '#43A047' },
  priority_urgent: { backgroundColor: '#FB8C00' },
  priority_critical: { backgroundColor: '#D32F2F' },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activePriorityText: {
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 32,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  disabledBtn: {
    opacity: 0.7,
  },
});

export default CreateRequestScreen;
