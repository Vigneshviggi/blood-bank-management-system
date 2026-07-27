import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Plus, Users, Calendar, MapPin, X, Trash2, Info } from 'lucide-react-native';
import CampCard from '../components/CampCard';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const ManageCamps = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: 0,
    longitude: 0,
    googlePlaceId: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: '100',
    bannerImage: null, // this will hold the image object
  });
  const [creating, setCreating] = useState(false);

  const [activeTab, setActiveTab] = useState('Upcoming');

  useEffect(() => {
    fetchMyCamps();
  }, []);

  const fetchMyCamps = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/camps/organized-by/${user._id || user.id}`);
      setCamps(res.data);
    } catch (err) {
      console.error('Error fetching camps', err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, bannerImage: result.assets[0] });
    }
  };

  const handleCreateCamp = async () => {
    if (!formData.title || !formData.location || !formData.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('latitude', String(formData.latitude));
      data.append('longitude', String(formData.longitude));
      data.append('googlePlaceId', formData.googlePlaceId);

      let formattedDate = formData.date;
      if (formattedDate.includes('/')) {
        const parts = formattedDate.split('/');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; 
        }
      }
      data.append('date', formattedDate);

      data.append('startTime', formData.startTime);
      data.append('endTime', formData.endTime);
      data.append('capacity', formData.capacity);
      data.append('organizerId', user._id || user.id);
      data.append('organizerName', user.name || user.hospitalName || 'Hospital Admin');
      data.append('organizerType', 'Hospital');

      if (formData.bannerImage) {
        // React Native requires uri, name, and type for File upload
        const uriParts = formData.bannerImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        data.append('bannerImage', {
          uri: formData.bannerImage.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      await api.post('/camps', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setModalVisible(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        capacity: '100',
        bannerImage: null,
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
              await api.delete(`/camps/${id}`);
              setCamps(prev => prev.filter(c => c._id !== id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete camp');
            }
          }
        }
      ]
    );
  };

  const renderCampCard = ({ item }) => {
    return (
      <View style={styles.campCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.campTitle}>{item.title}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={14} color={Colors.primary} />
          <Text style={styles.infoText}>{new Date(item.date).toLocaleDateString()}      {item.startTime} - {item.endTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={14} color={Colors.primary} />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Registered Donors</Text>
            <Text style={styles.statValue}>{item.registeredCount || 0}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Collected Units</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{item.status || 'Upcoming'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const filteredCamps = camps.filter(c => {
    const status = c.status || 'Upcoming';
    return status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <ScreenContainer scrollable={false} style={{ paddingHorizontal: 0 }}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Info size={24} color={Colors.text} style={{transform: [{rotate: '180deg'}]}} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Blood Camps</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['Upcoming', 'Ongoing', 'Completed'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredCamps}
          keyExtractor={(item) => item._id}
          renderItem={renderCampCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} camps.</Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalNav}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Info size={24} color={Colors.text} style={{transform: [{rotate: '180deg'}]}} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Create Blood Camp</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Camp Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Summer Blood Donation Camp"
              value={formData.title}
              onChangeText={(val) => setFormData({...formData, title: val})}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={formData.date}
                  onChangeText={(val) => setFormData({...formData, date: val})}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10:00 AM - 04:00 PM"
                  value={formData.startTime}
                  onChangeText={(val) => setFormData({...formData, startTime: val})}
                />
              </View>
            </View>

            <Text style={styles.label}>Venue</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Saveetha Hospital, Chennai"
              value={formData.location}
              onChangeText={(val) => setFormData({...formData, location: val})}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Join us to save lives. Every drop counts!"
              multiline
              value={formData.description}
              onChangeText={(val) => setFormData({...formData, description: val})}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Organizer</Text>
                <TextInput
                  style={styles.input}
                  value={user?.name || ''}
                  editable={false}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Max Donors</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.capacity}
                  onChangeText={(val) => setFormData({...formData, capacity: val})}
                />
              </View>
            </View>

            <Text style={styles.label}>Upload Poster</Text>
            <View style={styles.posterUploadRow}>
              {formData.bannerImage ? (
                <Image source={{ uri: formData.bannerImage.uri }} style={styles.posterThumb} />
              ) : (
                <View style={styles.posterThumbPlaceholder}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
              <TouchableOpacity onPress={pickImage}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.createBtn, creating && { opacity: 0.7 }]}
              onPress={handleCreateCamp}
              disabled={creating}
            >
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Create Camp</Text>}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  activeTabBtn: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  campCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: {
    marginBottom: 12,
  },
  campTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  statusPill: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  posterUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  posterThumb: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  posterThumbPlaceholder: {
    width: 60,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
  },
  changeLink: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ManageCamps;
