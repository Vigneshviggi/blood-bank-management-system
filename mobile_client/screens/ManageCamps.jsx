import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Plus, Users, Calendar, MapPin, X, Trash2 } from 'lucide-react-native';
import CampCard from '../components/CampCard';

const ManageCamps = () => {
  const { user } = useContext(AuthContext);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: '100',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMyCamps();
  }, []);

  const fetchMyCamps = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/camps/organized-by/${user.id}`);
      setCamps(res.data);
    } catch (err) {
      console.error('Error fetching camps', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCamp = async () => {
    if (!formData.title || !formData.location || !formData.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        ...formData,
        organizerId: user.id,
        organizerName: user.name,
      };
      await api.post('/api/camps', payload);
      setModalVisible(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        capacity: '100',
      });
      fetchMyCamps();
      Alert.alert('Success', 'Camp created successfully');
    } catch (err) {
      console.error('Error creating camp', err);
      Alert.alert('Error', 'Failed to create camp');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCamp = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this camp? All registrations will also be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await api.delete(`/api/camps/${id}`);
              setCamps(prev => prev.filter(c => c._id !== id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete camp');
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Camps</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={camps}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <CampCard camp={item} isOrganizer={true} />
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => handleDeleteCamp(item._id)}
              >
                <Trash2 size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>You haven't organized any camps yet.</Text>
            </GlassCard>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Camp</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Camp Title *</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. Summer Blood Drive 2024"
                value={formData.title}
                onChangeText={(val) => setFormData({...formData, title: val})}
              />

              <Text style={styles.label}>Location *</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. City Hall Plaza"
                value={formData.location}
                onChangeText={(val) => setFormData({...formData, location: val})}
              />

              <View style={styles.row}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.label}>Date *</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={formData.date}
                    onChangeText={(val) => setFormData({...formData, date: val})}
                  />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                  <Text style={styles.label}>Capacity</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="100"
                    keyboardType="number-pad"
                    value={formData.capacity}
                    onChangeText={(val) => setFormData({...formData, capacity: val})}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.label}>Start Time</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="09:00 AM"
                    value={formData.startTime}
                    onChangeText={(val) => setFormData({...formData, startTime: val})}
                  />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                  <Text style={styles.label}>End Time</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="05:00 PM"
                    value={formData.endTime}
                    onChangeText={(val) => setFormData({...formData, endTime: val})}
                  />
                </View>
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Details about the camp..."
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(val) => setFormData({...formData, description: val})}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, creating && styles.disabledBtn]}
                onPress={handleCreateCamp}
                disabled={creating}
              >
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Camp</Text>}
              </TouchableOpacity>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.7,
  },
});

export default ManageCamps;
