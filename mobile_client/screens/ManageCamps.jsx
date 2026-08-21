import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Plus, Users, Calendar, MapPin, X, Trash2, Info } from 'lucide-react-native';
import CampCard from '../components/CampCard';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getFallbackImage = (title) => {
  const t = title.toLowerCase();
  if (t.includes('college') || t.includes('university') || t.includes('student') || t.includes('campus')) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('hospital') || t.includes('clinic') || t.includes('health') || t.includes('medical') || t.includes('care')) {
    return 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('emergency') || t.includes('urgent')) {
    return 'https://images.unsplash.com/photo-1587559070757-f72a388edbba?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('corporate') || t.includes('office') || t.includes('tech') || t.includes('company')) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
  }
  // Generic Blood Donation Image
  return 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80';
};

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
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

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
    if (Number(formData.capacity) <= 0) {
      Alert.alert('Error', 'Maximum donors must be greater than 0');
      return;
    }
    if (formData.startTime && formData.endTime && formData.startTime === formData.endTime) {
       Alert.alert('Error', 'End time must be after start time');
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
        const uri = formData.bannerImage.uri;
        const filename = formData.bannerImage.fileName || uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        data.append('bannerImage', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: filename,
          type: formData.bannerImage.mimeType || type,
        });
      } else {
        // Use smart fallback image based on the title keywords
        data.append('bannerImage', getFallbackImage(formData.title));
      }

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${api.defaults.baseURL}/camps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

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

  const handleDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDateObj(selected);
      const formatted = `${String(selected.getDate()).padStart(2, '0')}/${String(selected.getMonth() + 1).padStart(2, '0')}/${selected.getFullYear()}`;
      setFormData({ ...formData, date: formatted });
    }
  };

  const formatTime = (dateObj) => {
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  };

  const handleStartTimeChange = (event, selected) => {
    setShowStartTimePicker(false);
    if (selected) {
      setFormData({ ...formData, startTime: formatTime(selected) });
    }
  };

  const handleEndTimeChange = (event, selected) => {
    setShowEndTimePicker(false);
    if (selected) {
      setFormData({ ...formData, endTime: formatTime(selected) });
    }
  };

  const handleGetLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      
      const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      let addrString = formData.location;
      
      if (address) {
        addrString = [address.name, address.street, address.city, address.region].filter(Boolean).join(', ');
      }
      
      setFormData({
        ...formData,
        latitude: lat,
        longitude: lng,
        location: addrString || 'Current Location'
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch location.');
    }
  };

  const renderCampCard = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.campCard}
        onPress={() => navigation.navigate('CampAttendees', { camp: item })}
        activeOpacity={0.7}
      >
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
      </TouchableOpacity>
    );
  };

  const filteredCamps = camps.filter(c => {
    const status = c.status || 'Upcoming';
    return status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="My Blood Camps" 
        showBack={false} 
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Plus size={24} color={Colors.text} />
          </TouchableOpacity>
        } 
      />

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
          <ScreenHeader 
            title="Create Blood Camp" 
            onBack={() => setModalVisible(false)} 
          />

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
                {Platform.OS === 'web' ? (
                   <input
                     type="date"
                     style={{ padding: 12, borderRadius: 8, border: '1px solid #F0E4E4', width: '100%' }}
                     value={formData.date ? formData.date.split('/').reverse().join('-') : ''}
                     onChange={(e) => {
                       const d = e.target.value;
                       if (d) {
                         const parts = d.split('-');
                         setFormData({...formData, date: `${parts[2]}/${parts[1]}/${parts[0]}`});
                       }
                     }}
                   />
                ) : (
                <TouchableOpacity 
                  style={[styles.input, { justifyContent: 'center' }]} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={formData.date ? Colors.text : { color: '#999' }}>
                    {formData.date || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Start Time</Text>
                {Platform.OS === 'web' ? (
                   <input
                     type="time"
                     style={{ padding: 12, borderRadius: 8, border: '1px solid #F0E4E4', width: '100%' }}
                     value={formData.startTime}
                     onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                   />
                ) : (
                <TouchableOpacity 
                  style={[styles.input, { justifyContent: 'center' }]} 
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={formData.startTime ? Colors.text : { color: '#999' }}>
                    {formData.startTime || '10:00 AM'}
                  </Text>
                </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>End Time</Text>
                {Platform.OS === 'web' ? (
                   <input
                     type="time"
                     style={{ padding: 12, borderRadius: 8, border: '1px solid #F0E4E4', width: '100%' }}
                     value={formData.endTime}
                     onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                   />
                ) : (
                <TouchableOpacity 
                  style={[styles.input, { justifyContent: 'center' }]} 
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={formData.endTime ? Colors.text : { color: '#999' }}>
                    {formData.endTime || '04:00 PM'}
                  </Text>
                </TouchableOpacity>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }} />
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDateObj}
                mode="date"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            {showStartTimePicker && (
              <DateTimePicker
                value={selectedDateObj}
                mode="time"
                onChange={handleStartTimeChange}
              />
            )}
            {showEndTimePicker && (
              <DateTimePicker
                value={selectedDateObj}
                mode="time"
                onChange={handleEndTimeChange}
              />
            )}

            <Text style={styles.label}>Venue</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="e.g. Saveetha Hospital, Chennai"
                value={formData.location}
                onChangeText={(val) => setFormData({...formData, location: val})}
              />
              <TouchableOpacity 
                style={styles.locationBtn} 
                onPress={handleGetLocation}
                activeOpacity={0.8}
              >
                <MapPin size={20} color="#fff" />
              </TouchableOpacity>
            </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E4E4',
    paddingBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F4EEEC',
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
    borderColor: '#F0E4E4',
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
    borderTopColor: '#F4EEEC',
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
    backgroundColor: '#E9F0FE',
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
    backgroundColor: Colors.background,
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
    borderColor: '#F0E4E4',
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
    backgroundColor: '#F4EEEC',
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
  locationBtn: {
    backgroundColor: Colors.primary,
    height: 44,
    width: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ManageCamps;
