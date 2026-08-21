import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Linking, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';
import { 
  User, Mail, Phone, MapPin, LogOut, Settings, ChevronRight, 
  History, Calendar, Award, Edit3, ShieldCheck, Heart, Zap, 
  CheckCircle2, Star, Activity, ShieldAlert,
  ArrowLeft, Copy, X, Navigation
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import socketService from '../services/socket';
import api from '../services/api';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const formatDate = (dateString) => {
  if (!dateString) return 'Eligible now';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatYear = (dateString) => {
  if (!dateString) return new Date().getFullYear();
  return new Date(dateString).getFullYear();
};

const PremiumColors = {
  primary: Colors.primary,
  background: Colors.background,
  card: '#FFFFFF',
  text: '#222222',
  textSecondary: '#888888',
  success: Colors.success,
  accent: Colors.accent,
  primarySoft: '#FDECEE',
  successSoft: '#E9F7EF',
  accentSoft: '#FFF8E6',
};

const ProfileScreen = ({ navigation, route }) => {
  const { user: currentUser, loading: authLoading, logout, updateUser } = useContext(AuthContext);
  const targetUserId = route?.params?.userId;
  const isViewingOtherUser = Boolean(targetUserId && targetUserId !== (currentUser?._id || currentUser?.id));

  const [viewedUser, setViewedUser] = useState(null);
  const [loadingOther, setLoadingOther] = useState(isViewingOtherUser);
  const [uploading, setUploading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Edit Profile Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: 'O+',
    location: '',
    bio: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (isViewingOtherUser && targetUserId) {
      setLoadingOther(true);
      api.get(`/users/${targetUserId}`)
        .then((res) => {
          setViewedUser(res.data?.user || res.data);
        })
        .catch(() => {
          api.get(`/donors/${targetUserId}`)
            .then((res) => setViewedUser(res.data))
            .catch((err) => {
              console.error('Failed to load user profile:', err);
              Alert.alert('Error', 'Unable to load donor profile.');
            });
        })
        .finally(() => {
          setLoadingOther(false);
        });
    } else {
      setViewedUser(null);
      setLoadingOther(false);
    }
  }, [isViewingOtherUser, targetUserId]);

  // Real-time socket sync for donor progress
  useEffect(() => {
    const handleProgressUpdate = (data) => {
      const currentId = user?._id || user?.id;
      if (data && data.userId && currentId && data.userId === currentId) {
        api.get('/users/profile')
          .then((res) => {
            if (res.data?.success && res.data.user && updateUser) {
              updateUser(res.data.user);
            }
          })
          .catch(() => {});
      }
    };

    socketService.on('donor_progress_updated', handleProgressUpdate);
    return () => {
      socketService.off('donor_progress_updated', handleProgressUpdate);
    };
  }, [user, updateUser]);

  const user = isViewingOtherUser ? viewedUser : currentUser;
  const loading = isViewingOtherUser ? loadingOther : authLoading;

  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    Alert.alert('Copied', `${fieldName} copied to clipboard!`);
  };

  const openEditModal = () => {
    setEditFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      bloodGroup: user?.bloodGroup || 'O+',
      location: user?.location || '',
      bio: user?.bio || '',
      latitude: user?.latitude || user?.coordinates?.coordinates?.[1] || '',
      longitude: user?.longitude || user?.coordinates?.coordinates?.[0] || '',
    });
    setIsEditModalVisible(true);
  };

  const handleGetGpsLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect your GPS coordinates.');
        setGpsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      let readableLocation = `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo && geo.length > 0) {
          const item = geo[0];
          const locality = item.subregion || item.city || item.district || item.name;
          const region = item.region || item.country;
          if (locality && region) readableLocation = `${locality}, ${region}`;
          else if (locality) readableLocation = locality;
        }
      } catch (_e) {}
      setEditFormData(prev => ({
        ...prev,
        latitude,
        longitude,
        location: readableLocation,
      }));
      Alert.alert('Location Acquired', `Detected: ${readableLocation}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to retrieve GPS coordinates.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFormData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      const payload = {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        bloodGroup: editFormData.bloodGroup,
        location: editFormData.location.trim(),
        bio: editFormData.bio.trim(),
      };
      if (
        editFormData.latitude !== '' &&
        editFormData.longitude !== '' &&
        !isNaN(Number(editFormData.latitude)) &&
        !isNaN(Number(editFormData.longitude))
      ) {
        payload.latitude = Number(editFormData.latitude);
        payload.longitude = Number(editFormData.longitude);
        payload.coordinates = {
          type: 'Point',
          coordinates: [Number(editFormData.longitude), Number(editFormData.latitude)],
        };
      }
      const res = await api.put(`/users/${user._id || user.id}`, payload);
      const updatedData = res.data?.user || res.data;
      if (updateUser) {
        updateUser(updatedData);
      }
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile details updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Activity size={32} color={PremiumColors.primary} />
        <Text style={{ marginTop: 12, color: PremiumColors.textSecondary }}>
          {isViewingOtherUser ? 'Loading donor profile...' : 'Loading profile...'}
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ShieldAlert size={32} color={PremiumColors.textSecondary} />
        <Text style={{ marginTop: 12, color: PremiumColors.textSecondary }}>Unable to load profile</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: PremiumColors.primary, borderRadius: 8 }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Database-Driven Progression & Achievements ───
  const userDonationsCount = Number(user?.donationsCount) || 0;
  const userPoints = Number(user?.points) || 0;
  const donorLevel = user?.donorLevel || (userPoints >= 2000 ? 6 : userPoints >= 1000 ? 5 : userPoints >= 500 ? 4 : userPoints >= 250 ? 3 : userPoints >= 100 ? 2 : 1);
  const donorRank = user?.donorRank || (donorLevel >= 6 ? 'LifeLink Champion' : donorLevel >= 5 ? 'Life Saver' : donorLevel >= 4 ? 'Dedicated Donor' : donorLevel >= 3 ? 'Regular Donor' : donorLevel >= 2 ? 'Active Donor' : 'New Donor');
  const nextLevelXp = user?.nextLevelXp || (donorLevel === 1 ? 100 : donorLevel === 2 ? 250 : donorLevel === 3 ? 500 : donorLevel === 4 ? 1000 : donorLevel === 5 ? 2000 : null);
  const currentLevelMin = user?.currentLevelMin || (donorLevel === 1 ? 0 : donorLevel === 2 ? 100 : donorLevel === 3 ? 250 : donorLevel === 4 ? 500 : donorLevel === 5 ? 1000 : 2000);
  const pointsInCurrentLevel = user?.pointsInCurrentLevel ?? Math.max(0, userPoints - currentLevelMin);
  const pointsNeededNextLevel = user?.pointsNeededNextLevel ?? (nextLevelXp ? Math.max(0, nextLevelXp - userPoints) : 0);
  const levelProgressPercent = user?.progressPercent ?? (nextLevelXp ? Math.min(100, Math.max(0, Math.round(((userPoints - currentLevelMin) / (nextLevelXp - currentLevelMin)) * 100))) : 100);

  const stats = [
    { label: 'Donations', value: userDonationsCount, icon: <Heart size={16} color={PremiumColors.primary} /> },
    { label: 'Responses', value: user?.responses || 0, icon: <Zap size={16} color={PremiumColors.accent} /> },
    { label: 'Certificates', value: user?.certificates || (userDonationsCount > 0 ? 1 : 0), icon: <Award size={16} color={PremiumColors.success} /> },
  ];

  // Achievements list (all achievements with locked/unlocked status from backend)
  const defaultAchievements = [
    { key: 'FIRST_DONATION', title: 'First Donation', description: 'Complete 1st blood donation', icon: '🩸', unlocked: userDonationsCount >= 1 },
    { key: 'BRONZE_DONOR', title: '3+ Donations', description: 'Complete 3 blood donations', icon: '🥉', unlocked: userDonationsCount >= 3 },
    { key: 'FIVE_DONATIONS', title: '5+ Donations', description: 'Complete 5 blood donations', icon: '🏅', unlocked: userDonationsCount >= 5 },
    { key: 'TEN_DONATIONS', title: '10+ Donations', description: 'Complete 10 blood donations', icon: '🏆', unlocked: userDonationsCount >= 10 },
    { key: 'TWENTY_FIVE_DONATIONS', title: '25+ Donations', description: 'LifeLink Hero with 25 donations', icon: '❤️', unlocked: userDonationsCount >= 25 },
    { key: 'EMERGENCY_HERO', title: 'Emergency Hero', description: 'Complete emergency donation', icon: '🚨', unlocked: Boolean(user?.emergencyDonationsCount >= 1) },
  ];
  const achievements = (user?.achievements && user.achievements.length > 0) ? user.achievements : defaultAchievements;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload a profile picture!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0]);
    }
  };

  const handleImageUpload = async (imageFile) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const uriParts = imageFile.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('profileImage', {
        uri: imageFile.uri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      });

      const res = await api.post(`/users/${user._id || user.id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        if (updateUser) {
          updateUser({ ...user, imageUrl: res.data.imageUrl });
        }
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderOption = (icon, label, onPress, isDestructive = false) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.optionLeft}>
        <View style={[styles.optionIconContainer, isDestructive && { backgroundColor: '#FDECEE' }]}>
          {icon}
        </View>
        <Text style={[styles.optionLabel, isDestructive && { color: PremiumColors.primary }]}>{label}</Text>
      </View>
      {!isDestructive && <ChevronRight size={20} color={PremiumColors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Top Header */}
      <View style={styles.header}>
        {isViewingOtherUser ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={PremiumColors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>
          {isViewingOtherUser ? 'Donor Profile' : 'My Profile'}
        </Text>
        {!isViewingOtherUser ? (
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Settings size={22} color={PremiumColors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: user?.imageUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.avatar}
          />
          {!isViewingOtherUser && (
            <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={pickImage} disabled={uploading}>
              {uploading ? (
                <Activity size={14} color="#FFF" />
              ) : (
                <Edit3 size={14} color="#FFF" />
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.name}>{user?.name} {isViewingOtherUser ? '' : '👋'}</Text>
        
        <View style={styles.verifiedRow}>
          <ShieldCheck size={16} color={PremiumColors.success} />
          <Text style={styles.verifiedText}>
            {user?.role === 'hospital' ? 'Verified Hospital' : 'Verified Blood Donor'}
          </Text>
        </View>

        <View style={styles.chipRow}>
          {user?.role !== 'hospital' && (
            <View style={styles.bloodChip}>
              <Text style={styles.bloodChipText}>❤️ {user?.bloodGroup || 'O+'}</Text>
            </View>
          )}
          <View style={styles.levelChip}>
            <Star size={12} color={PremiumColors.accent} fill={PremiumColors.accent} />
            <Text style={styles.levelChipText}>
              {user?.role === 'hospital' ? 'Premium Hospital' : `Level ${donorLevel} Donor`}
            </Text>
          </View>
        </View>
        <Text style={styles.xpText}>{userPoints} XP • {donorRank}</Text>

        {!isViewingOtherUser && (
          <TouchableOpacity 
            style={styles.editProfilePillBtn}
            onPress={openEditModal}
            activeOpacity={0.8}
          >
            <Edit3 size={14} color={PremiumColors.primary} />
            <Text style={styles.editProfilePillText}>Edit Profile Details</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dynamic Progress Section */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Donor Level {donorLevel}</Text>
          <Text style={styles.progressValues}>{pointsInCurrentLevel} / 250 XP</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${levelProgressPercent}%` }]} />
        </View>
        <Text style={styles.progressFooter}>{pointsNeededNextLevel} XP to Level {donorLevel + 1}</Text>
      </View>

      {/* Digital Donor Card */}
      <View style={styles.donorCard}>
        <View style={styles.donorCardHeader}>
          <Text style={styles.donorCardTitle}>❤️ DONOR CARD</Text>
          <Text style={styles.donorCardBgGroup}>{user?.bloodGroup || 'O+'}</Text>
        </View>
        
        <Text style={styles.donorCardName}>{user?.name}</Text>
        <View style={styles.donorCardVerified}>
          <CheckCircle2 size={14} color="#FFF" />
          <Text style={styles.donorCardVerifiedText}>Verified Donor</Text>
        </View>

        <View style={styles.donorCardStatsRow}>
          <View style={styles.donorCardStatItem}>
            <Text style={styles.donorCardStatLabel}>Member Since</Text>
            <Text style={styles.donorCardStatValue}>{formatYear(user?.createdAt)}</Text>
          </View>
          <View style={styles.donorCardStatItem}>
            <Text style={styles.donorCardStatLabel}>Donations</Text>
            <Text style={styles.donorCardStatValue}>{userDonationsCount}</Text>
          </View>
          <View style={styles.donorCardStatItem}>
            <Text style={styles.donorCardStatLabel}>Next Donation</Text>
            <Text style={styles.donorCardStatValue}>{user?.nextDonationDate ? formatDate(user.nextDonationDate) : 'Eligible'}</Text>
          </View>
        </View>
      </View>

      {/* Stats Horizontal Card */}
      <View style={styles.statsCard}>
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <View style={styles.statBox}>
              <View style={styles.statIconWrapper}>{stat.icon}</View>
              <Text style={styles.statBoxValue}>{stat.value}</Text>
              <Text style={styles.statBoxLabel}>{stat.label}</Text>
            </View>
            {index < stats.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Contact & Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Location</Text>
        <View style={styles.infoCard}>
          {/* Mobile Phone */}
          <View style={styles.infoRowWithAction}>
            <View style={styles.infoRowLeft}>
              <Phone size={18} color={PremiumColors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
            {user?.phone ? (
              <View style={styles.contactActions}>
                <TouchableOpacity 
                  style={styles.actionBtnSmall} 
                  onPress={() => copyToClipboard(user.phone, 'Phone number')}
                  activeOpacity={0.7}
                >
                  <Copy size={13} color={PremiumColors.primary} />
                  <Text style={styles.actionBtnTextSmall}>
                    {copiedField === 'Phone number' ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtnSmall, { backgroundColor: PremiumColors.primary }]} 
                  onPress={() => Linking.openURL(`tel:${user.phone}`)}
                  activeOpacity={0.7}
                >
                  <Phone size={13} color="#FFF" />
                  <Text style={[styles.actionBtnTextSmall, { color: '#FFF' }]}>Call</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <View style={styles.infoDivider} />

          {/* Email */}
          <View style={styles.infoRowWithAction}>
            <View style={styles.infoRowLeft}>
              <Mail size={18} color={PremiumColors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{user?.email || 'Not provided'}</Text>
              </View>
            </View>
            {user?.email ? (
              <View style={styles.contactActions}>
                <TouchableOpacity 
                  style={styles.actionBtnSmall} 
                  onPress={() => copyToClipboard(user.email, 'Email address')}
                  activeOpacity={0.7}
                >
                  <Copy size={13} color={PremiumColors.primary} />
                  <Text style={styles.actionBtnTextSmall}>
                    {copiedField === 'Email address' ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtnSmall, { backgroundColor: PremiumColors.accent }]} 
                  onPress={() => Linking.openURL(`mailto:${user.email}`)}
                  activeOpacity={0.7}
                >
                  <Mail size={13} color="#FFF" />
                  <Text style={[styles.actionBtnTextSmall, { color: '#FFF' }]}>Email</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <View style={styles.infoDivider} />

          {/* Address */}
          <View style={styles.infoRow}>
            <MapPin size={18} color={PremiumColors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location / Area</Text>
              <Text style={styles.infoValue}>{user?.location || 'Not provided'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Database-Driven Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements & Milestones</Text>
        <View style={styles.achievementsContainer}>
          {achievements.map((ach) => (
            <View 
              key={ach.key || ach.title} 
              style={[
                styles.achievementCard,
                ach.unlocked ? styles.achievementCardUnlocked : styles.achievementCardLocked
              ]}
            >
              <Text style={styles.achievementIcon}>{ach.icon || '🏅'}</Text>
              <View style={styles.achievementContent}>
                <View style={styles.achievementHeaderRow}>
                  <Text style={[styles.achievementTitle, !ach.unlocked && styles.achievementTitleLocked]}>
                    {ach.title}
                  </Text>
                  <View style={[styles.achievementBadge, ach.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                    <Text style={[styles.achievementBadgeText, ach.unlocked ? styles.badgeTextUnlocked : styles.badgeTextLocked]}>
                      {ach.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.achievementDesc}>{ach.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Direct Contact Button Card for Other Users */}
      {isViewingOtherUser && user?.phone && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.fullContactBtn}
            onPress={() => Linking.openURL(`tel:${user.phone}`)}
            activeOpacity={0.8}
          >
            <Phone size={18} color="#FFF" />
            <Text style={styles.fullContactBtnText}>Call Donor ({user.phone})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Activity (Only for own profile) */}
      {!isViewingOtherUser && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.listCard}>
            {renderOption(<History size={20} color={PremiumColors.primary} />, 'Donation History', () => navigation.navigate('RequestHistory'))}
            {renderOption(<Calendar size={20} color={PremiumColors.primary} />, 'Registered Camps', () => navigation.navigate('Camps'))}
          </View>
        </View>
      )}

      {/* Settings & Profile Actions (Only for own profile) */}
      {!isViewingOtherUser && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Account</Text>
          <View style={styles.listCard}>
            {renderOption(<User size={20} color={PremiumColors.textSecondary} />, 'Edit Profile Details', openEditModal)}
            {renderOption(<ShieldCheck size={20} color={PremiumColors.textSecondary} />, 'Privacy', () => {})}
            {renderOption(<Activity size={20} color={PremiumColors.textSecondary} />, 'Medical Details', () => {})}
            {renderOption(<ShieldAlert size={20} color={PremiumColors.textSecondary} />, 'Emergency Contacts', () => {})}
            {renderOption(<Settings size={20} color={PremiumColors.textSecondary} />, 'Help & Support', () => {})}
            {renderOption(<LogOut size={20} color={PremiumColors.primary} />, 'Logout', handleLogout, true)}
          </View>
        </View>
      )}

      <View style={{ height: 60 }} />

      {/* ─── Edit Profile Modal ─── */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.editModalOverlay}
        >
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Profile Details</Text>
              <TouchableOpacity 
                onPress={() => setIsEditModalVisible(false)}
                style={styles.editModalCloseBtn}
              >
                <X size={20} color={PremiumColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.editModalBody}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData(p => ({ ...p, name: text }))}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData(p => ({ ...p, phone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Blood Group */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Blood Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bloodSelectRow}>
                  {BLOOD_GROUPS.map(bg => (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.bloodSelectPill,
                        editFormData.bloodGroup === bg && styles.bloodSelectPillActive
                      ]}
                      onPress={() => setEditFormData(p => ({ ...p, bloodGroup: bg }))}
                    >
                      <Text style={[
                        styles.bloodSelectPillText,
                        editFormData.bloodGroup === bg && styles.bloodSelectPillTextActive
                      ]}>
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Location with GPS */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.inputLabel}>Location / Address</Text>
                  <TouchableOpacity 
                    onPress={handleGetGpsLocation} 
                    disabled={gpsLoading}
                    style={styles.gpsButton}
                  >
                    <Navigation size={12} color={PremiumColors.primary} />
                    <Text style={styles.gpsButtonText}>
                      {gpsLoading ? 'Acquiring GPS...' : '📍 Get GPS'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.location}
                  onChangeText={(text) => setEditFormData(p => ({ ...p, location: text }))}
                  placeholder="City, District or Area"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio / Note</Text>
                <TextInput
                  style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                  value={editFormData.bio}
                  onChangeText={(text) => setEditFormData(p => ({ ...p, bio: text }))}
                  placeholder="Tell us about yourself..."
                  multiline
                  placeholderTextColor="#999"
                />
              </View>

              {/* Save & Cancel Buttons */}
              <View style={styles.editModalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsEditModalVisible(false)}
                  disabled={savingProfile}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PremiumColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 10,
  },
  settingsBtn: {
    padding: 8,
    backgroundColor: PremiumColors.card,
    borderRadius: Radius.full,
    ...Shadows.soft,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Shadows.medium,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    backgroundColor: PremiumColors.primary,
    padding: 8,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: PremiumColors.text,
    fontFamily: Typography.heading,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  verifiedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: PremiumColors.success,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bloodChip: {
    backgroundColor: PremiumColors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  bloodChipText: {
    color: PremiumColors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PremiumColors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  levelChipText: {
    marginLeft: 6,
    color: PremiumColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  xpText: {
    fontSize: 13,
    color: PremiumColors.textSecondary,
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: 24,
    backgroundColor: PremiumColors.card,
    padding: 20,
    borderRadius: Radius.xl,
    marginBottom: 24,
    ...Shadows.soft,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    fontWeight: '800',
    color: PremiumColors.text,
    fontSize: 15,
  },
  progressValues: {
    fontWeight: '700',
    color: PremiumColors.textSecondary,
    fontSize: 13,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PremiumColors.primary,
    borderRadius: Radius.full,
  },
  progressFooter: {
    fontSize: 12,
    fontWeight: '600',
    color: PremiumColors.textSecondary,
    textAlign: 'right',
  },
  donorCard: {
    marginHorizontal: 24,
    backgroundColor: PremiumColors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.medium,
  },
  donorCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  donorCardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 13,
  },
  donorCardBgGroup: {
    position: 'absolute',
    right: -20,
    top: -20,
    fontSize: 120,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.08)',
  },
  donorCardName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: Typography.heading,
  },
  donorCardVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 32,
  },
  donorCardVerifiedText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  donorCardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  donorCardStatItem: {
    alignItems: 'flex-start',
  },
  donorCardStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  donorCardStatValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: PremiumColors.card,
    marginHorizontal: 24,
    borderRadius: 24,
    paddingVertical: 20,
    marginBottom: 24,
    ...Shadows.soft,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIconWrapper: {
    marginBottom: 8,
  },
  statBoxValue: {
    fontSize: 22,
    fontWeight: '800',
    color: PremiumColors.text,
  },
  statBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PremiumColors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  miniCardsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  miniCard: {
    flex: 1,
    backgroundColor: PremiumColors.card,
    borderRadius: 24,
    padding: 20,
    ...Shadows.soft,
  },
  streakCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCard: {
    alignItems: 'flex-start',
  },
  miniCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PremiumColors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  miniCardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: PremiumColors.textSecondary,
  },
  miniCardBtn: {
    marginTop: 12,
    backgroundColor: PremiumColors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  miniCardBtnText: {
    color: PremiumColors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PremiumColors.text,
    marginBottom: 16,
    fontFamily: Typography.heading,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: PremiumColors.card,
    borderRadius: 24,
    padding: 20,
    ...Shadows.soft,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRowWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PremiumColors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: PremiumColors.text,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: PremiumColors.primarySoft,
  },
  actionBtnTextSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: PremiumColors.primary,
  },
  fullContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PremiumColors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    ...Shadows.primaryGlow,
  },
  fullContactBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PremiumColors.text,
    fontFamily: Typography.heading,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: PremiumColors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  listCard: {
    backgroundColor: PremiumColors.card,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    ...Shadows.soft,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: PremiumColors.text,
    marginLeft: 16,
  },

  // Edit Profile Button & Modal Styles
  editProfilePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: PremiumColors.primarySoft,
    borderWidth: 1,
    borderColor: PremiumColors.primary + '30',
  },
  editProfilePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: PremiumColors.primary,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PremiumColors.text,
    fontFamily: Typography.heading,
  },
  editModalCloseBtn: {
    padding: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F5F5F5',
  },
  editModalBody: {
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: PremiumColors.text,
    backgroundColor: '#F8FAFC',
  },
  bloodSelectRow: {
    flexDirection: 'row',
  },
  bloodSelectPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bloodSelectPillActive: {
    backgroundColor: PremiumColors.primary,
    borderColor: PremiumColors.primary,
  },
  bloodSelectPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  bloodSelectPillTextActive: {
    color: '#FFFFFF',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: PremiumColors.primarySoft,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: PremiumColors.primary,
  },
  editModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: PremiumColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Achievements Styles
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    ...Shadows.soft,
  },
  achievementCardUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FDE68A',
  },
  achievementCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
  achievementIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: PremiumColors.text,
    fontFamily: Typography.heading,
  },
  achievementTitleLocked: {
    color: '#64748B',
  },
  achievementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeUnlocked: {
    backgroundColor: '#DCFCE7',
  },
  badgeLocked: {
    backgroundColor: '#E2E8F0',
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextUnlocked: {
    color: '#15803D',
  },
  badgeTextLocked: {
    color: '#64748B',
  },
  achievementDesc: {
    fontSize: 12,
    color: PremiumColors.textSecondary,
    lineHeight: 16,
  },
});

export default ProfileScreen;
