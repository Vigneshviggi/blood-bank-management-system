import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import * as Haptics from 'expo-haptics';

export default function HospitalDropdown({ selectedId, selectedName, onSelect, error }) {
  const [hospitals, setHospitals] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/hospitals');
        setHospitals(response.data || []);
      } catch (error) {
        console.log('Failed to fetch hospitals:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if opening or hasn't fetched yet
    if (isVisible && hospitals.length === 0) {
      fetchHospitals();
    }
  }, [isVisible]);

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVisible(true);
  };

  const handleSelect = (hospital) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hospital) {
      onSelect(hospital._id, hospital.name);
    } else {
      onSelect('', '');
    }
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>Target Hospital</Text>
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={selectedName ? styles.inputText : styles.placeholderText}>
          {selectedName || 'Choose a hospital (Optional)'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6E6771" />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Hospital</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleSelect(null)}
              >
                <Text style={styles.modalItemText}>None / Any Hospital</Text>
                {!selectedId && <Ionicons name="checkmark-circle" size={20} color="#C81E4A" />}
              </TouchableOpacity>
              
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#C81E4A" />
                  <Text style={styles.loadingText}>Loading hospitals...</Text>
                </View>
              ) : (
                hospitals.map(h => (
                  <TouchableOpacity
                    key={h._id}
                    style={styles.modalItem}
                    onPress={() => handleSelect(h)}
                  >
                    <View>
                      <Text style={styles.modalItemText}>{h.name}</Text>
                      {h.address && <Text style={styles.modalItemSubtext}>{h.address}</Text>}
                    </View>
                    {selectedId === h._id && <Ionicons name="checkmark-circle" size={20} color="#C81E4A" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  labelError: {
    color: '#C81E4A',
  },
  input: {
    backgroundColor: '#1D1B20',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: 'rgba(255, 82, 82, 0.5)',
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
  },
  inputText: {
    color: '#FFF',
    fontSize: 16,
  },
  placeholderText: {
    color: '#6E6771',
    fontSize: 16,
  },
  errorText: {
    color: '#C81E4A',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1D1B20',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1B20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemSubtext: {
    color: '#6E6771',
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6E6771',
    marginTop: 10,
    fontSize: 14,
  },
});
