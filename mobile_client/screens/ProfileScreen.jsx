import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import { Colors, Radius, Shadows, Typography } from '../constants/Theme';
import { 
  User, Mail, Phone, MapPin, LogOut, Settings, ChevronRight, 
  History, Calendar, Award, Edit3, ShieldCheck, Heart, Zap, 
  Flame, CheckCircle2, Gift, Star, Bell, Activity, ShieldAlert
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const PremiumColors = {
  primary: '#D90429',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#222222',
  textSecondary: '#888888',
  success: '#27AE60',
  accent: '#FFB703',
  primarySoft: '#FDECEE',
  successSoft: '#E9F7EF',
  accentSoft: '#FFF8E6',
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);

  const stats = [
    { label: 'Donations', value: user?.donations || 12, icon: <Heart size={16} color={PremiumColors.primary} /> },
    { label: 'Responses', value: user?.responses || 8, icon: <Zap size={16} color={PremiumColors.accent} /> },
    { label: 'Certificates', value: user?.certificates || 3, icon: <Award size={16} color={PremiumColors.success} /> },
  ];

  const badges = [
    { label: 'Fast Responder', color: PremiumColors.success, bg: PremiumColors.successSoft },
    { label: 'Life Saver', color: PremiumColors.primary, bg: PremiumColors.primarySoft },
    { label: 'Donor Elite', color: PremiumColors.accent, bg: PremiumColors.accentSoft },
    { label: 'Community Hero', color: '#8E44AD', bg: '#F4ECF7' },
    { label: '10+ Donations', color: '#E67E22', bg: '#FDF2E9' },
  ];

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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          {/* Optional: Add a back button here if needed */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
          <Settings size={22} color={PremiumColors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: user?.imageUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={pickImage} disabled={uploading}>
            {uploading ? (
              <Activity size={14} color="#FFF" />
            ) : (
              <Edit3 size={14} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.name}>{user?.name || 'Bhanu'} 👋</Text>
        
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
            <Text style={styles.levelChipText}>{user?.role === 'hospital' ? 'Premium Hospital' : 'Level 8 Donor'}</Text>
          </View>
        </View>
        <Text style={styles.xpText}>1250 XP • Community Hero</Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Level 8</Text>
          <Text style={styles.progressValues}>1250 / 2000 XP</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '62%' }]} />
        </View>
        <Text style={styles.progressFooter}>750 XP to Level 9</Text>
      </View>

      {/* Digital Donor Card */}
      <View style={styles.donorCard}>
        <View style={styles.donorCardHeader}>
          <Text style={styles.donorCardTitle}>❤️ DONOR CARD</Text>
          <Text style={styles.donorCardBgGroup}>{user?.bloodGroup || 'O+'}</Text>
        </View>
        
        <Text style={styles.donorCardName}>{user?.name || 'Bhanu'}</Text>
        <View style={styles.donorCardVerified}>
          <CheckCircle2 size={14} color="#FFF" />
          <Text style={styles.donorCardVerifiedText}>Verified Donor</Text>
        </View>

        <View style={styles.donorCardStatsRow}>
          <View style={styles.donorCardStatItem}>
            <Text style={styles.donorCardStatLabel}>Member Since</Text>
            <Text style={styles.donorCardStatValue}>2024</Text>
          </View>
          <View style={styles.donorCardStatItem}>
            <Text style={styles.donorCardStatLabel}>Lives Helped</Text>
            <Text style={styles.donorCardStatValue}>12</Text>
          </View>
          <View style={styles.donorCardStatItem}>
            <Text style={styles.donorCardStatLabel}>Next Donation</Text>
            <Text style={styles.donorCardStatValue}>15 Aug 2026</Text>
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

      {/* Mini Cards Row: Streak & Reminder */}
      <View style={styles.miniCardsRow}>
        <View style={[styles.miniCard, styles.streakCard]}>
          <Flame size={24} color={PremiumColors.accent} fill={PremiumColors.accent} />
          <Text style={styles.miniCardTitle}>Donation Streak</Text>
          <Text style={styles.miniCardSubtitle}>3 Consecutive</Text>
        </View>
        
        <View style={[styles.miniCard, styles.reminderCard]}>
          <Calendar size={24} color={PremiumColors.primary} />
          <Text style={styles.miniCardTitle}>Next Eligible</Text>
          <Text style={styles.miniCardSubtitle}>15 August 2026</Text>
          <TouchableOpacity style={styles.miniCardBtn}>
            <Text style={styles.miniCardBtnText}>Donate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Achievement Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgesWrapper}>
          {badges.map((badge, index) => (
            <View key={index} style={[styles.badgeItem, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>● {badge.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={18} color={PremiumColors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'bhanu@gmail.com'}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          
          <View style={styles.infoRow}>
            <Phone size={18} color={PremiumColors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mobile</Text>
              <Text style={styles.infoValue}>{user?.phone || '9177347086'}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <MapPin size={18} color={PremiumColors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{user?.location || 'Arvapalle'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.listCard}>
          {renderOption(<History size={20} color={PremiumColors.primary} />, 'Donation History', () => navigation.navigate('RequestHistory'))}
          {renderOption(<Calendar size={20} color={PremiumColors.primary} />, 'Registered Camps', () => navigation.navigate('Camps'))}
          {renderOption(<Award size={20} color={PremiumColors.success} />, 'Certificates', () => {})}
          {renderOption(<Gift size={20} color={PremiumColors.accent} />, 'Rewards', () => {})}
          {renderOption(<Star size={20} color={PremiumColors.accent} />, 'Reviews', () => {})}
          {renderOption(<Bell size={20} color={PremiumColors.primary} />, 'Notifications', () => {})}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.listCard}>
          {renderOption(<User size={20} color={PremiumColors.textSecondary} />, 'Edit Profile', () => navigation.navigate('Settings'))}
          {renderOption(<ShieldCheck size={20} color={PremiumColors.textSecondary} />, 'Privacy', () => {})}
          {renderOption(<Activity size={20} color={PremiumColors.textSecondary} />, 'Medical Details', () => {})}
          {renderOption(<ShieldAlert size={20} color={PremiumColors.textSecondary} />, 'Emergency Contacts', () => {})}
          {renderOption(<Settings size={20} color={PremiumColors.textSecondary} />, 'Help & Support', () => {})}
          {renderOption(<LogOut size={20} color={PremiumColors.primary} />, 'Logout', handleLogout, true)}
        </View>
      </View>

      <View style={{ height: 60 }} />
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
  infoContent: {
    marginLeft: 16,
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
});

export default ProfileScreen;
