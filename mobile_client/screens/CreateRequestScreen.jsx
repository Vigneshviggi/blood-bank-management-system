import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Send, CheckCircle2, ChevronDown, X, Calendar as CalendarIcon, MapPin } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const priorityLevels = ['Normal', 'High', 'Critical'];

const CreateRequestScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  const initialScenario = user?.role === 'hospital' ? 'hospital_to_person' : 'person_to_hospital';
  const [scenario, setScenario] = useState(initialScenario);
  
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    bloodGroup: '',
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
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        if (scenario === 'hospital_to_medical_unit') {
          const res = await api.get('/blood-bank');
          setHospitals(res.data);
        } else {
          const res = await api.get('/hospitals');
          setHospitals(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch targets", err);
      }
    };
    fetchTargets();
  }, [scenario]);

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    if (newScenario === 'hospital_to_person') {
      setFormData(prev => ({ ...prev, hospitalId: user?.hospitalId || '' }));
    } else {
      setFormData(prev => ({ ...prev, hospitalId: '' }));
    }
  };

  const captureLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission was denied. You can enter the pickup address manually.');
        setGpsLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      let readableAddress = 'Current device location';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (geocode && geocode.length > 0) {
          const addr = geocode[0];
          readableAddress = [addr.city || addr.subregion, addr.region || addr.country].filter(Boolean).join(', ');
        }
      } catch (geoErr) {
        console.log("Reverse geocode failed", geoErr);
      }

      setFormData((prev) => ({
        ...prev,
        latitude: String(loc.coords.latitude),
        longitude: String(loc.coords.longitude),
        location: readableAddress
      }));
    } catch (err) {
      console.log('Unable to fetch location', err);
      Alert.alert('Error', 'Unable to determine your location. Please enter the address manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.bloodGroup) return Alert.alert('Validation Error', 'Please select a blood group.');
    if (!formData.unitsNeeded || Number(formData.unitsNeeded) < 1) return Alert.alert('Validation Error', 'Please select at least 1 unit.');
    if (!formData.patientCondition.trim()) return Alert.alert('Validation Error', 'Please enter the patient condition.');
    if (!formData.location.trim()) return Alert.alert('Validation Error', 'Please enter the pickup location.');
    if (!formData.contactNumber.trim() || formData.contactNumber.length < 5) return Alert.alert('Validation Error', 'Please enter a valid contact number.');

    setLoading(true);
    try {
      let requesterType = user?.role === 'hospital' ? 'hospital' : 'donor';
      let requesterTypeModel = user?.role === 'hospital' ? 'Hospital' : 'User';
      let targetType = 'person';

      if (scenario === 'hospital_to_hospital' || scenario === 'person_to_hospital') {
        targetType = 'hospital';
      } else if (scenario === 'hospital_to_medical_unit') {
        targetType = 'blood_bank';
      }

      const payload = {
        requesterType,
        requesterId: user?._id || user?.id,
        requesterTypeModel,
        targetType,
        patientName: formData.patientName || 'Blood Request',
        bloodGroup: formData.bloodGroup,
        unitsNeeded: Number(formData.unitsNeeded),
        emergencyLevel: formData.emergencyLevel,
        patientCondition: formData.patientCondition,
        hospitalId: formData.hospitalId || null,
        location: formData.location,
        requiredBefore: formData.requiredBefore || undefined,
        contactNumber: formData.contactNumber,
        contactInfo: formData.contactNumber,
        reason: formData.reason,
      };

      if (
        formData.latitude !== '' &&
        formData.longitude !== '' &&
        !isNaN(Number(formData.latitude)) &&
        !isNaN(Number(formData.longitude))
      ) {
        const lat = Number(formData.latitude);
        const lng = Number(formData.longitude);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0)) {
          payload.latitude = lat;
          payload.longitude = lng;
          payload.coordinates = {
            type: 'Point',
            coordinates: [lng, lat]
          };
        }
      }

      await api.post('/requests', payload);
      Alert.alert('Success', 'Blood request created successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Error creating request', err);
      const msg = err.response?.data?.message || 'Failed to submit request. Please try again later.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedHospitalName = () => {
    const defaultText = scenario === 'hospital_to_medical_unit' ? 'Any Available Medical Unit' : 'Any Available Hospital';
    if (!formData.hospitalId) return defaultText;
    const h = hospitals.find(h => h._id === formData.hospitalId);
    return h ? h.name : defaultText;
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      if (Platform.OS === 'android') setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event, time) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (time) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(time.getHours());
      finalDate.setMinutes(time.getMinutes());
      setSelectedDate(finalDate);
      
      const formatted = finalDate.getFullYear() + '-' +
        String(finalDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(finalDate.getDate()).padStart(2, '0') + ' ' +
        String(finalDate.getHours()).padStart(2, '0') + ':' +
        String(finalDate.getMinutes()).padStart(2, '0');
        
      setFormData({ ...formData, requiredBefore: formatted });
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Blood Request" subtitle="Urgent Request Form" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* SCENARIOS */}
          <View style={styles.scenarioGrid}>
            {user?.role === 'hospital' ? (
              <>
                <ScenarioCard title="Hospital → Person" active={scenario === 'hospital_to_person'} onPress={() => handleScenarioChange('hospital_to_person')} />
                <ScenarioCard title="Hospital → Hospital" active={scenario === 'hospital_to_hospital'} onPress={() => handleScenarioChange('hospital_to_hospital')} />
                <ScenarioCard title="Hospital → Medical Unit" active={scenario === 'hospital_to_medical_unit'} onPress={() => handleScenarioChange('hospital_to_medical_unit')} />
              </>
            ) : (
              <>
                <ScenarioCard title="Person → Hospital" active={scenario === 'person_to_hospital'} onPress={() => handleScenarioChange('person_to_hospital')} />
                <ScenarioCard title="Person → Person" active={scenario === 'person_to_person'} onPress={() => handleScenarioChange('person_to_person')} />
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>{user?.role === 'hospital' ? 'Hospital Name / Patient Name' : 'Patient Name'}</Text>
            <TextInput
              style={styles.input}
              value={formData.patientName}
              onChangeText={(text) => setFormData({ ...formData, patientName: text })}
              placeholder={user?.role === 'hospital' ? "Enter hospital or patient name" : "Enter patient name"}
            />

            {/* Blood Group */}
            <Text style={styles.label}>Blood Group Needed *</Text>
            <View style={styles.groupContainer}>
              {bloodGroups.map(group => (
                <TouchableOpacity 
                  key={group}
                  style={[styles.groupChip, formData.bloodGroup === group && styles.activeChip]}
                  onPress={() => setFormData({...formData, bloodGroup: group})}
                  accessibilityLabel={`Select ${group}`}
                  accessibilityRole="button"
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
                style={[styles.unitBtn, Number(formData.unitsNeeded) <= 1 && styles.disabledUnitBtn]}
                onPress={() => setFormData(p => ({...p, unitsNeeded: String(Math.max(1, Number(p.unitsNeeded) - 1))}))}
                disabled={Number(formData.unitsNeeded) <= 1}
                accessibilityLabel="Decrease units"
                accessibilityRole="button"
              >
                <Text style={[styles.unitBtnText, Number(formData.unitsNeeded) <= 1 && styles.disabledUnitText]}>−</Text>
              </TouchableOpacity>
              <Text style={styles.unitValue}>{formData.unitsNeeded}</Text>
              <TouchableOpacity 
                style={styles.unitBtn}
                onPress={() => setFormData(p => ({...p, unitsNeeded: String(Number(p.unitsNeeded) + 1)}))}
                accessibilityLabel="Increase units"
                accessibilityRole="button"
              >
                <Text style={styles.unitBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Priority Level */}
            <Text style={styles.label}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorityLevels.map(level => {
                const isActive = formData.emergencyLevel === level;
                let activeStyle = {};
                if (isActive) {
                  if (level === 'High') activeStyle = { backgroundColor: '#F59E0B', borderColor: '#F59E0B' };
                  else if (level === 'Critical') activeStyle = { backgroundColor: Colors.error, borderColor: Colors.error };
                  else activeStyle = { backgroundColor: Colors.textSecondary, borderColor: Colors.textSecondary };
                }
                return (
                  <TouchableOpacity 
                    key={level}
                    style={[styles.priorityBtn, isActive && activeStyle]}
                    onPress={() => setFormData({...formData, emergencyLevel: level})}
                  >
                    <Text style={[styles.priorityText, isActive && styles.activePriorityText]}>
                      {level.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Location / Pickup Address *</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Enter pickup location"
              />
              <TouchableOpacity 
                style={styles.gpsBtn} 
                onPress={captureLocation}
                disabled={gpsLoading}
                accessibilityLabel="Use current location"
                accessibilityRole="button"
              >
                {gpsLoading ? <ActivityIndicator color={Colors.primary} size="small" /> : <MapPin size={20} color={Colors.primary} />}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.contactNumber}
              onChangeText={(text) => setFormData({ ...formData, contactNumber: text.replace(/[^0-9+() -]/g, '') })}
              placeholder="Emergency contact number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Required Before (Optional)</Text>
            <TouchableOpacity 
              style={[styles.input, {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, !formData.requiredBefore && {color: Colors.textSecondary}]}>
                {formData.requiredBefore || 'Select Date & Time'}
              </Text>
              <CalendarIcon size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
            
            {/* Target Hospital (If applicable) */}
            {(scenario.includes('to_hospital') || scenario === 'hospital_to_medical_unit') && (
              <View>
                <Text style={styles.label}>{scenario === 'hospital_to_medical_unit' ? 'Select Target Medical Unit' : 'Select Target Hospital'}</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setShowHospitalPicker(true)}>
                  <Text style={styles.dropdownText} numberOfLines={1}>{getSelectedHospitalName()}</Text>
                  <ChevronDown size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.labelRow}>
              <Text style={styles.label}>{user?.role === 'hospital' ? 'Reason / Condition *' : 'Patient Condition *'}</Text>
              <Text style={styles.charCount}>{formData.patientCondition.length}/100</Text>
            </View>
            <TextInput 
              style={styles.input}
              placeholder={user?.role === 'hospital' ? "e.g. Critical Surgery" : "e.g. Critical Surgery, Accident"}
              value={formData.patientCondition}
              onChangeText={(val) => { if(val.length <= 100) setFormData({...formData, patientCondition: val}) }}
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>Additional Details</Text>
              <Text style={styles.charCount}>{formData.reason.length}/150</Text>
            </View>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Describe the urgency or specific requirements..."
              multiline
              numberOfLines={4}
              value={formData.reason}
              onChangeText={(val) => { if(val.length <= 150) setFormData({...formData, reason: val}) }}
            />

            {/* Submit */}
            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.disabledBtn]} 
              onPress={handleSubmit}
              disabled={loading}
              accessibilityLabel="Submit blood request"
              accessibilityRole="button"
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.submitBtnText}>SUBMITTING REQUEST...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>SUBMIT REQUEST</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Hospital Picker Modal */}
      <Modal visible={showHospitalPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{scenario === 'hospital_to_medical_unit' ? 'Select Medical Unit' : 'Select Hospital'}</Text>
              <TouchableOpacity onPress={() => setShowHospitalPicker(false)} style={{padding: 8}}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => { setFormData({...formData, hospitalId: ''}); setShowHospitalPicker(false); }}
              >
                <Text style={styles.modalItemText}>Any Available {scenario === 'hospital_to_medical_unit' ? 'Medical Unit' : 'Hospital'}</Text>
                {!formData.hospitalId && <CheckCircle2 size={20} color={Colors.success} />}
              </TouchableOpacity>
              {hospitals.map(h => (
                <TouchableOpacity 
                  key={h._id}
                  style={styles.modalItem}
                  onPress={() => { setFormData({...formData, hospitalId: h._id}); setShowHospitalPicker(false); }}
                >
                  <Text style={styles.modalItemText}>{h.name}</Text>
                  {formData.hospitalId === h._id && <CheckCircle2 size={20} color={Colors.success} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const ScenarioCard = ({ title, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.scenarioCard, active && styles.scenarioCardActive]} 
    onPress={onPress}
  >
    <Text style={[styles.scenarioTitle, active && styles.scenarioTitleActive]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  scenarioCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scenarioCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FDE7ED',
  },
  scenarioTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scenarioTitleActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
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
    width: '22%',
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: '#FDE7ED',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
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
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledUnitBtn: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E5E7EB',
  },
  unitBtnText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  disabledUnitText: {
    color: Colors.textMuted,
  },
  unitValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    width: 32,
    textAlign: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  activePriorityText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
  },
  inputText: {
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsBtn: {
    backgroundColor: '#FDE7ED',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    height: 48,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    minHeight: 56,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
  },
});

export default CreateRequestScreen;
