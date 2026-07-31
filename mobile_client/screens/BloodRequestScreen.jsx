import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBloodRequestForm } from '../hooks/useBloodRequestForm';

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

  const containerStyle = useMemo(() => [
    styles.scrollContainer, 
    { paddingBottom: Math.max(insets.bottom + 120, 120) } // Ensure large padding for BottomNav + Button
  ], [insets.bottom]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={containerStyle} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Blood Request</Text>
            <Text style={styles.headerSubtitle}>Urgent Request Form</Text>
          </View>

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
    backgroundColor: '#121212', // Pure dark for seamless UI
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#C81E4A',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    shadowColor: '#C81E4A',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    marginTop: 6,
    fontWeight: '500',
  },
  formContainer: {
    padding: 24,
    marginTop: -20, // Overlap the header slightly for a modern card feel
  },
});
