import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import CampCard from '../components/CampCard';
import api from '../services/api';
import { Colors, Radius, Typography } from '../constants/Theme';
import EmptyStateView from '../components/EmptyStateView';
import { AuthContext } from '../context/AuthContext';
import { Search } from 'lucide-react-native';

const FILTERS = ['All', 'Live', 'Upcoming', 'Registered', 'Completed'];

const CampsScreen = ({ navigation }) => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registeredCamps, setRegisteredCamps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [apiError, setApiError] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCamps();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegisteredCamps();
    } else {
      setRegisteredCamps([]);
    }
  }, [user]);

  const fetchCamps = async () => {
    setApiError(false);
    try {
      const res = await api.get('/camps');
      setCamps(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error('Error fetching camps', err);
      setApiError(true);
      setCamps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRegisteredCamps = async () => {
    try {
      const regRes = await api.get('/camps/my-registrations');
      setRegisteredCamps(Array.isArray(regRes.data) ? regRes.data : regRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching camp registrations', err);
      setRegisteredCamps([]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCamps();
    if (user) fetchRegisteredCamps();
  };

  const handleRegister = async (camp) => {
    try {
      // POST to the secure API endpoint
      const res = await api.post(`/camps/${camp._id}/register`);
      if (res.data.success) {
        setRegisteredCamps(prev => [...prev, camp._id]);
        setCamps(prev => prev.map(c => 
          c._id === camp._id && res.data.camp 
            ? { ...c, registeredCount: res.data.camp.registeredCount, currentRegistrations: res.data.camp.currentRegistrations } 
            : c
        ));
      }
    } catch (error) {
      console.error('Registration failed', error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'Unable to register for this camp.');
    }
  };

  // Filter and Search logic
  const filteredCamps = useMemo(() => {
    let result = camps;
    const now = new Date();

    // 1. Apply Search
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c => 
        (c.title && c.title.toLowerCase().includes(lowerQuery)) ||
        (c.location && c.location.toLowerCase().includes(lowerQuery)) ||
        (c.venueName && c.venueName.toLowerCase().includes(lowerQuery)) ||
        (c.organizerName && c.organizerName.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Apply Tabs Filter
    if (activeFilter !== 'All') {
      result = result.filter(c => {
        const startDate = new Date(c.date);
        const isCompleted = c.status === 'Completed' || (new Date(c.date).setHours(23, 59, 59, 999) < now);
        const isLive = !isCompleted && startDate.toDateString() === now.toDateString();

        if (activeFilter === 'Live') return isLive;
        if (activeFilter === 'Upcoming') return !isLive && !isCompleted;
        if (activeFilter === 'Completed') return isCompleted;
        if (activeFilter === 'Registered') return registeredCamps.includes(c._id);
        return true;
      });
    }

    return result;
  }, [camps, searchQuery, activeFilter, registeredCamps]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Blood Donation Camps</Text>
      <Text style={styles.subtitle}>Discover upcoming donation drives, see attendance and register instantly.</Text>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search camps or locations..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(filter => (
          <TouchableOpacity 
            key={filter} 
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    
    if (apiError) {
      return (
        <EmptyStateView
          title="Unable to load camps"
          message="We encountered an error connecting to our servers."
        />
      );
    }
    
    if (searchQuery.trim() !== '') {
      return (
        <EmptyStateView
          title="No camps found"
          message={`No camps matching "${searchQuery}"`}
        />
      );
    }

    if (activeFilter !== 'All') {
      return (
        <EmptyStateView
          title={`No ${activeFilter.toLowerCase()} camps`}
          message={`Check back later for ${activeFilter.toLowerCase()} blood donation drives.`}
        />
      );
    }

    return (
      <EmptyStateView
        title="No donation camps found"
        message="Check back later for upcoming blood donation drives."
      />
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      <FlatList
        data={filteredCamps}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CampCard
            camp={item}
            isRegistered={registeredCamps.includes(item._id)}
            onPress={() => navigation.navigate('CampDetails', { camp: item })}
            onRegister={() => handleRegister(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        windowSize={10}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172033', // Dark Navy
    fontFamily: Typography.heading,
  },
  subtitle: {
    marginTop: 6,
    color: '#64748B', // Secondary text
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#172033',
    height: '100%',
  },
  filterScroll: {
    marginHorizontal: -20, // Negative margin to allow full-width scroll
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#E53935', // LifeLink Red
    borderColor: '#E53935',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 120, // Prevents bottom tab overlap
  },
});

export default CampsScreen;
