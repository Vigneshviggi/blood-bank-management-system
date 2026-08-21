import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import { Colors, Typography, Shadows } from '../constants/Theme';
import { MapPin, Calendar, Building2, Clock, Navigation, CheckCircle2, UserPlus } from 'lucide-react-native';
import { openCampNavigation } from '../utils/navigationHelper';

const CampDetailsScreen = ({ route, navigation }) => {
  const { camp: initialCamp } = route.params;
  const [camp, setCamp] = useState(initialCamp);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchCamp = useCallback(async () => {
    try {
      const res = await api.get(`/camps/${camp._id}`);
      setCamp(res.data);

      if (user) {
        // Fetch user's registered camps to check
        const regRes = await api.get('/camps/my-registrations');
        const registrations = Array.isArray(regRes.data) ? regRes.data : regRes.data?.data || [];
        if (registrations.includes(camp._id)) {
          setIsRegistered(true);
        }
      }
    } catch (err) {
      console.error('Error fetching camp details', err);
    }
  }, [camp._id, user]);

  useEffect(() => {
    fetchCamp();
  }, [fetchCamp]);

  const handleRegister = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to register for camps.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post(`/camps/${camp._id}/register`);
      if (res.data.success) {
        setIsRegistered(true);
        if (res.data.camp) setCamp(res.data.camp);
        Alert.alert('Success', 'You have successfully registered for this camp!');
      }
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Failed to register');
    }
    setActionLoading(false);
  };

  const handleCancelRegistration = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your registration for this camp?',
      [
        { text: 'No, keep it', style: 'cancel' },
        { 
          text: 'Yes, cancel', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await api.delete(`/camps/${camp._id}/register`);
              if (res.data.success) {
                setIsRegistered(false);
                if (res.data.camp) setCamp(res.data.camp);
                Alert.alert('Cancelled', 'Your registration has been cancelled.');
              }
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel registration');
            }
            setActionLoading(false);
          }
        }
      ]
    );
  };

  const handleNavigate = () => {
    openCampNavigation(camp);
  };

  // Status calculation
  const now = new Date();
  const startDate = new Date(camp.date);
  const isCompleted = camp.status === 'Completed' || (new Date(camp.date).setHours(23, 59, 59, 999) < now);
  const isLive = !isCompleted && startDate.toDateString() === now.toDateString();
  
  let statusText = 'UPCOMING';
  if (isLive) statusText = 'LIVE';
  if (isCompleted) statusText = 'COMPLETED';

  // Capacity calculations
  const capacity = Number(camp.capacity || camp.maxParticipants || 0);
  const registeredCount = Number(camp.registeredCount || camp.currentRegistrations || 0);
  const isFull = capacity > 0 && registeredCount >= capacity;
  const occupancy = capacity > 0 ? Math.min(100, Math.max(0, (registeredCount / capacity) * 100)) : 0;

  const bannerUri = camp.bannerImage || 'https://img.freepik.com/free-vector/blood-donation-concept-illustration_114360-1282.jpg';
  const defaultStartTime = camp.startTime || '09:00 AM';
  const defaultEndTime = camp.endTime || '04:00 PM';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Camp Details" 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Large Image Header */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: bannerUri }} style={styles.banner} resizeMode="cover" />
          <View style={[styles.statusBadge, 
            isLive ? styles.statusLive : 
            isCompleted ? styles.statusCompleted : 
            styles.statusUpcoming
          ]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Camp Info Header */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{camp.title || 'Blood Donation Camp'}</Text>
          
          <View style={styles.organizerRow}>
            <Building2 size={16} color={Colors.textSecondary} />
            <Text style={styles.organizerText}>{camp.organizerName || 'LifeLink Partner'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Date & Location Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconBox}>
              <Calendar size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconBox}>
              <Clock size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{defaultStartTime} - {defaultEndTime}</Text>
            </View>
          </View>

          <View style={[styles.detailItem, { width: '100%', marginTop: 12 }]}>
            <View style={styles.detailIconBox}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{camp.location || 'Location unavailable'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Registration Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              <Text style={{ fontWeight: '800', color: Colors.text }}>{registeredCount}</Text> / {capacity || '∞'} Registered
            </Text>
            <Text style={styles.percentageText}>{Math.round(occupancy)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${occupancy}%` }]} />
          </View>
        </View>

        <View style={styles.divider} />

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About this camp</Text>
          <Text style={styles.description}>
            {camp.description || 'Join our community blood donation drive and help save lives. On-site medical professionals will guide you through a safe and comfortable donation process.'}
          </Text>
          
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Organizer</Text>
          <Text style={styles.description}>
            {camp.organizerName || 'LifeLink Partner'}{'\n'}
            {camp.organizerContact ? `Contact: ${camp.organizerContact}` : 'Authorized Medical Partner'}
          </Text>
        </View>

      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        {isCompleted ? (
          <View style={[styles.mainBtn, styles.btnDisabled]}>
            <Text style={styles.btnTextDisabled}>Registration Closed</Text>
          </View>
        ) : isRegistered ? (
          <TouchableOpacity 
            style={[styles.mainBtn, styles.btnRegistered]} 
            onPress={handleCancelRegistration}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            {actionLoading ? <ActivityIndicator size="small" color="#16A34A" /> : <CheckCircle2 size={20} color="#16A34A" />}
            <Text style={[styles.btnText, { color: '#16A34A', marginLeft: 8 }]}>You Registered</Text>
          </TouchableOpacity>
        ) : isFull ? (
          <View style={[styles.mainBtn, styles.btnDisabled]}>
            <Text style={styles.btnTextDisabled}>Camp Full</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.mainBtn, styles.btnPrimary]} 
            onPress={handleRegister}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            {actionLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <UserPlus size={20} color="#FFFFFF" />}
            <Text style={[styles.btnText, { color: '#FFFFFF', marginLeft: 8 }]}>Register Now</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.navigateBtn} 
          onPress={handleNavigate}
          activeOpacity={0.8}
        >
          <Navigation size={20} color="#E53935" />
          <Text style={styles.navigateText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    ...Shadows.sm,
  },
  statusLive: {
    backgroundColor: '#E53935',
  },
  statusUpcoming: {
    backgroundColor: '#F59E0B',
  },
  statusCompleted: {
    backgroundColor: '#64748B',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172033',
    fontFamily: Typography.heading,
    marginBottom: 12,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(229, 57, 53, 0.1)', // Light Red
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#172033',
    fontWeight: '700',
  },
  progressSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E53935',
    borderRadius: 4,
  },
  aboutSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24, // Safe area padding fallback
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Shadows.md,
  },
  mainBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  btnPrimary: {
    backgroundColor: '#E53935',
  },
  btnRegistered: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  btnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextDisabled: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navigateBtn: {
    width: 100,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  navigateText: {
    color: '#E53935',
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default CampDetailsScreen;
