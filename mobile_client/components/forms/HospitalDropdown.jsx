import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { ChevronDown, X, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/Theme';
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
        style={[styles.dropdown, error && styles.dropdownError]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !selectedName && styles.dropdownTextPlaceholder]}>
          {selectedName || 'Choose a hospital (Optional)'}
        </Text>
        <ChevronDown size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Hospital</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleSelect(null)}
              >
                <Text style={styles.modalItemText}>None / Any Hospital</Text>
                {!selectedId && <CheckCircle2 size={20} color={Colors.primary} />}
              </TouchableOpacity>
              
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={Colors.primary} />
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
                    {selectedId === h._id && <CheckCircle2 size={20} color={Colors.primary} />}
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
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelError: {
    color: Colors.error,
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
  dropdownError: {
    borderColor: 'rgba(255, 82, 82, 0.5)',
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
  },
  dropdownText: {
    color: Colors.text,
    fontSize: 15,
    flex: 1,
  },
  dropdownTextPlaceholder: {
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
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
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
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
