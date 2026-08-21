import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useBloodRequestForm } from '../hooks/useBloodRequestForm';
import { Colors } from '../constants/Theme';
import ScreenHeader from '../components/ScreenHeader';

// Custom Reusable Form Components
import BloodGroupSelector from '../components/forms/BloodGroupSelector';
import UnitsCounter from '../components/forms/UnitsCounter';
import PrioritySelector from '../components/forms/PrioritySelector';
import HospitalDropdown from '../components/forms/HospitalDropdown';
import FormInput from '../components/forms/FormInput';
import SubmitButton from '../components/forms/SubmitButton';
import SuccessModal from '../components/ui/SuccessModal';

export default function BloodRequestScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const {
    formData,
    updateField,
    errors,
    isLoading,
    isSuccessModalVisible,
    setIsSuccessModalVisible,
    submitForm
  } = useBloodRequestForm(navigation);

  const [gpsLoading, setGpsLoading] = useState(false);

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

      updateField('latitude', String(loc.coords.latitude));
      updateField('longitude', String(loc.coords.longitude));
      updateField('location', readableAddress);
    } catch (err) {
      console.log('Unable to fetch location', err);
      Alert.alert('Error', 'Unable to determine your location. Please enter the address manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  const containerStyle = useMemo(() => [
    styles.scrollContainer, 
    { paddingBottom: Math.max(insets.bottom + 130, 150) }
  ], [insets.bottom]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Blood Request" subtitle="Urgent Request Form" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={containerStyle} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.formContainer}>
            <BloodGroupSelector 
              selectedGroup={formData.bloodGroup} 
              onSelect={(group) => updateField('bloodGroup', group)} 
              error={errors.bloodGroup}
            />

            <UnitsCounter 
              units={formData.unitsNeeded} 
              onChange={(units) => updateField('unitsNeeded', units)} 
              error={errors.unitsNeeded}
            />

            <PrioritySelector 
              selectedPriority={formData.emergencyLevel} 
              onSelect={(level) => updateField('emergencyLevel', level)} 
            />

            <HospitalDropdown 
              selectedId={formData.hospitalId}
              selectedName={formData.hospitalName}
              onSelect={(id, name) => {
                updateField('hospitalId', id);
                updateField('hospitalName', name);
              }}
              error={errors.hospitalId}
            />

            <FormInput 
              label="Patient Condition *"
              placeholder="e.g., Surgery, Accident"
              value={formData.patientCondition}
              onChangeText={(text) => updateField('patientCondition', text)}
              error={errors.patientCondition}
              maxLength={100}
            />

            <FormInput 
              label="Location / Pickup Address *"
              placeholder="Full Address"
              value={formData.location}
              onChangeText={(text) => updateField('location', text)}
              error={errors.location}
              maxLength={150}
              rightElement={
                <TouchableOpacity 
                  style={styles.gpsBtn} 
                  onPress={captureLocation}
                  disabled={gpsLoading}
                >
                  {gpsLoading ? <ActivityIndicator color={Colors.primary} size="small" /> : <MapPin size={20} color={Colors.primary} />}
                </TouchableOpacity>
              }
            />

            <FormInput 
              label="Contact Number *"
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={formData.contactInfo}
              onChangeText={(text) => updateField('contactInfo', text)}
              error={errors.contactInfo}
              maxLength={15}
            />

            <SubmitButton 
              title="Submit Request" 
              onPress={submitForm} 
              isLoading={isLoading} 
              disabled={isLoading}
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal 
        visible={isSuccessModalVisible} 
        onFinish={() => {
          setIsSuccessModalVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
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
  gpsBtn: {
    backgroundColor: '#FDE7ED',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    height: 48,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -1,
  },
});
