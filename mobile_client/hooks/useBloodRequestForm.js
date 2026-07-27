import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Network from 'expo-network';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import React from 'react';

const STORAGE_KEY = '@blood_request_draft';

const DEFAULT_STATE = {
  bloodGroup: '',
  unitsNeeded: 1,
  emergencyLevel: 'Normal',
  hospitalId: '',
  hospitalName: '',
  patientCondition: '',
  location: '',
  contactInfo: '',
};

export const useBloodRequestForm = (navigation) => {
  const { user } = React.useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    ...DEFAULT_STATE,
    location: user?.location || '',
    contactInfo: user?.phone || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // Load draft from AsyncStorage
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem(STORAGE_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load form draft', e);
      }
    };
    loadDraft();
  }, []);

  // Auto-save draft
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        console.error('Failed to save form draft', e);
      }
    };
    
    // Use a small debounce or just save on change
    const timeout = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeout);
  }, [formData]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (formData.unitsNeeded < 1) newErrors.unitsNeeded = 'At least 1 unit is required';
    if (!formData.patientCondition.trim()) newErrors.patientCondition = 'Patient condition is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact number is required';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please check the highlighted fields.',
      });
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    // Check Network
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'No Internet Connection',
        text2: 'Please connect to the internet to submit the request.',
      });
      return;
    }

    setIsLoading(true);

    const targetType = formData.hospitalId ? 'hospital' : 'person';

    const requestPayload = {
      requesterType: 'donor',
      requesterId: user?._id || user?.id,
      requesterTypeModel: 'User',
      targetType,
      bloodGroup: formData.bloodGroup,
      unitsNeeded: formData.unitsNeeded,
      emergencyLevel: formData.emergencyLevel,
      hospitalId: formData.hospitalId || undefined,
      patientCondition: formData.patientCondition,
      location: formData.location,
      contactInfo: formData.contactInfo,
      reason: formData.patientCondition,
    };

    try {
      await api.post('/requests', requestPayload);
      
      // Clear draft on success
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      setIsSuccessModalVisible(true);
      
      // Reset form visually
      setFormData({
        ...DEFAULT_STATE,
        location: user?.location || '',
        contactInfo: user?.phone || '',
      });
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.response?.data?.message || 'Could not submit request. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateField,
    errors,
    isLoading,
    isSuccessModalVisible,
    setIsSuccessModalVisible,
    submitForm,
  };
};
