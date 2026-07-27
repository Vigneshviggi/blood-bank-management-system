import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { ChevronLeft, Send, CheckCircle2, ChevronDown, X } from 'lucide-react-native';

const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const priorityLevels = ['Normal', 'High', 'Critical'];

const CreateRequestScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  const initialScenario = user?.role === 'hospital' ? 'hospital_to_person' : 'person_to_hospital';
  const [scenario, setScenario] = useState(initialScenario);
  
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    bloodGroup: 'O+',
    unitsNeeded: '1',
    emergencyLevel: 'Normal',
    patientCondition: '',
    hospitalId: user?.hospitalId || '',
    location: user?.location || '',
    latitude: '',
    longitude: '',
    requiredBefore: '',
    contactNumber: user?.phone || '',
    contactInfo: user?.phone || '',
    reason: '',
  });

  const [hospitals, setHospitals] = useState([]);
  const [showHospitalPicker, setShowHospitalPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        setHospitals(res.data);
      } catch (err) {
        console.error("Failed to fetch hospitals", err);
      }
    };
    fetchHospitals();
  }, []);

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    if (newScenario === 'hospital_to_person') {
      setFormData(prev => ({ ...prev, hospitalId: user?.hospitalId || '' }));
    } else if (newScenario === 'hospital_to_hospital') {
      setFormData(prev => ({ ...prev, hospitalId: '' }));
    } else if (newScenario === 'person_to_hospital') {
      setFormData(prev => ({ ...prev, hospitalId: '' }));
    } else if (newScenario === 'person_to_person') {
      setFormData(prev => ({ ...prev, hospitalId: '' }));
    }
  };

  const captureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied', 'Enable location access to share the emergency site.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setFormData((prev) => ({
        ...prev,
        latitude: String(loc.coords.latitude),
        longitude: String(loc.coords.longitude),
        location: prev.location || 'Current device location'
      }));
      Alert.alert('Location captured', 'Current device location has been attached to the request.');
    } catch (err) {
      console.error('Unable to fetch location', err);
      Alert.alert('Error', 'Unable to fetch current location.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.bloodGroup || !formData.unitsNeeded) {
      Alert.alert('Error', 'Please fill in blood group and units.');
      return;
    }

    setLoading(true);
    try {
      let requesterType = user?.role === 'hospital' ? 'hospital' : 'donor';
      let requesterTypeModel = user?.role === 'hospital' ? 'Hospital' : 'User';
      let targetType = 'person';

      if (scenario === 'hospital_to_hospital' || scenario === 'person_to_hospital') {
        targetType = 'hospital';
      }

      const payload = {
        requesterType,
        requesterId: user?._id || user?.id,
        requesterTypeModel,
        targetType,
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        unitsNeeded: Number(formData.unitsNeeded),
        emergencyLevel: formData.emergencyLevel,
        patientCondition: formData.patientCondition,
        hospitalId: formData.hospitalId || null,
        location: formData.location,
        latitude: Number(formData.latitude || 0),
        longitude: Number(formData.longitude || 0),
        requiredBefore: formData.requiredBefore || undefined,
        contactNumber: formData.contactNumber,
        contactInfo: formData.contactNumber || formData.contactInfo,
        reason: formData.reason,
      };

      await api.post('/requests', payload);
      Alert.alert('Success', 'Blood request created successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Error creating request', err);
      Alert.alert('Error', 'Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedHospitalName = () => {
    if (!formData.hospitalId) return 'Any Available Hospital';
    const h = hospitals.find(h => h._id === formData.hospitalId);
    return h ? h.name : 'Any Available Hospital';
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Blood Requests</Text>
          <Text style={styles.subtitle}>Create urgent requirements</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SCENARIOS */}
        <View style={styles.scenarioGrid}>
          {user?.role === 'hospital' ? (
            <>
              <ScenarioCard 
                title="Hospital → Person" 
                desc="Emergency donor request" 
                active={scenario === 'hospital_to_person'} 
                onPress={() => handleScenarioChange('hospital_to_person')}
              />
              <ScenarioCard 
                title="Hospital → Hospital" 
                desc="Unit transfer request" 
                active={scenario === 'hospital_to_hospital'} 
                onPress={() => handleScenarioChange('hospital_to_hospital')}
              />
            </>
          ) : (
            <>
              <ScenarioCard 
                title="Person → Hospital" 
                desc="Search unit availability" 
                active={scenario === 'person_to_hospital'} 
                onPress={() => handleScenarioChange('person_to_hospital')}
              />
              <ScenarioCard 
                title="Person → Person" 
                desc="Direct donor request" 
                active={scenario === 'person_to_person'} 
                onPress={() => handleScenarioChange('person_to_person')}
              />
            </>
          )}
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Patient Name</Text>
          <TextInput
            style={styles.input}
            value={formData.patientName}
            onChangeText={(text) => setFormData({ ...formData, patientName: text })}
            placeholder="Enter patient or requester name"
          />

          {/* Blood Group */}
          <Text style={styles.label}>Blood Group Needed *</Text>
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

          {/* Units Required */}
          <Text style={styles.label}>Units Required *</Text>
          <View style={styles.unitsContainer}>
            <TouchableOpacity 
              style={styles.unitBtn}
              onPress={() => setFormData(p => ({...p, unitsNeeded: String(Math.max(1, Number(p.unitsNeeded) - 1))}))}
            >
              <Text style={styles.unitBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.unitValue}>{formData.unitsNeeded}</Text>
            <TouchableOpacity 
              style={styles.unitBtn}
              onPress={() => setFormData(p => ({...p, unitsNeeded: String(Number(p.unitsNeeded) + 1)}))}
            >
              <Text style={styles.unitBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Priority Level */}
          <Text style={styles.label}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {priorityLevels.map(level => (
              <TouchableOpacity 
                key={level}
                style={[
                  styles.priorityBtn, 
                  formData.emergencyLevel === level && styles.activePriorityBtn,
                  formData.emergencyLevel === level && level === 'Critical' && {backgroundColor: '#D32F2F'},
                  formData.emergencyLevel === level && level === 'High' && {backgroundColor: '#FB8C00'}
                ]}
                onPress={() => setFormData({...formData, emergencyLevel: level})}
              >
                <Text style={[styles.priorityText, formData.emergencyLevel === level && styles.activePriorityText]}>
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Hospital or pickup location"
            />
            <TouchableOpacity style={styles.locateBtn} onPress={captureLocation}>
              <Text style={styles.locateBtnText}>GPS</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            value={formData.contactNumber}
            onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
            placeholder="Emergency contact number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Required Before</Text>
          <TextInput
            style={styles.input}
            value={formData.requiredBefore}
            onChangeText={(text) => setFormData({ ...formData, requiredBefore: text })}
            placeholder="YYYY-MM-DD HH:mm"
          />

          {/* Target Hospital (If applicable) */}
          {scenario.includes('to_hospital') && (
            <View>
              <Text style={styles.label}>Select Target Hospital</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowHospitalPicker(true)}>
                <Text style={styles.dropdownText}>{getSelectedHospitalName()}</Text>
                <ChevronDown size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Patient Condition */}
          <Text style={styles.label}>Patient Condition</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Critical Surgery, Accident"
            value={formData.patientCondition}
            onChangeText={(val) => setFormData({...formData, patientCondition: val})}
          />

          {/* Reason */}
          <Text style={styles.label}>Additional Details</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Describe the urgency or specific requirements..."
            multiline
            numberOfLines={4}
            value={formData.reason}
            onChangeText={(val) => setFormData({...formData, reason: val})}
          />

          {/* Submit */}
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
                <Text style={styles.submitBtnText}>Submit {scenario.replace(/_/g, ' ').toUpperCase()}</Text>
              </>
            )}
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>

      {/* Hospital Picker Modal */}
      <Modal visible={showHospitalPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Hospital</Text>
              <TouchableOpacity onPress={() => setShowHospitalPicker(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => { setFormData({...formData, hospitalId: ''}); setShowHospitalPicker(false); }}
              >
                <Text style={styles.modalItemText}>Any Available Hospital</Text>
                {!formData.hospitalId && <CheckCircle2 size={20} color={Colors.primary} />}
              </TouchableOpacity>
              {hospitals.map(h => (
                <TouchableOpacity 
                  key={h._id}
                  style={styles.modalItem}
                  onPress={() => { setFormData({...formData, hospitalId: h._id}); setShowHospitalPicker(false); }}
                >
                  <Text style={styles.modalItemText}>{h.name}</Text>
                  {formData.hospitalId === h._id && <CheckCircle2 size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
};

const ScenarioCard = ({ title, desc, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.scenarioCard, active && styles.scenarioCardActive]} 
    onPress={onPress}
  >
    <View style={[styles.scenarioIconBox, active && styles.scenarioIconBoxActive]}>
      <Text style={[styles.scenarioIcon, active && styles.scenarioIconActive]}>→</Text>
    </View>
    <View style={{flex: 1}}>
      <Text style={[styles.scenarioTitle, active && styles.scenarioTitleActive]}>{title}</Text>
      <Text style={styles.scenarioDesc}>{desc}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scenarioGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  scenarioCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scenarioCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F5',
  },
  scenarioIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  scenarioIconBoxActive: {
    backgroundColor: Colors.primary,
  },
  scenarioIcon: {
    fontSize: 18,
    color: '#888',
    fontWeight: 'bold',
  },
  scenarioIconActive: {
    color: '#fff',
  },
  scenarioTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    textTransform: 'uppercase',
  },
  scenarioTitleActive: {
    color: Colors.primary,
  },
  scenarioDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  card: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  groupChip: {
    width: '23%',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: '#FFF5F5',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activeChipText: {
    color: Colors.primary,
  },
  unitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  unitBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitBtnText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  unitValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    width: 40,
    textAlign: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activePriorityBtn: {
    backgroundColor: Colors.primary,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  activePriorityText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  locateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 32,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default CreateRequestScreen;
