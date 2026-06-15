import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import { User, Mail, Phone, MapPin, Droplets, LogOut, Settings, ChevronRight, History, Calendar } from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

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

  const renderOption = (icon, label, onPress) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>{icon}</View>
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      <ChevronRight size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Settings size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Image 
          source={{ uri: user?.imageUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
        
        {user?.role !== 'hospital' && (
          <View style={styles.bloodBadge}>
            <Droplets size={16} color="#fff" />
            <Text style={styles.bloodText}>{user?.bloodGroup || 'N/A'}</Text>
          </View>
        )}
      </View>

      <GlassCard style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Mail size={18} color={Colors.primary} />
          <Text style={styles.detailText}>{user?.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={18} color={Colors.primary} />
          <Text style={styles.detailText}>{user?.phone || 'No phone provided'}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={18} color={Colors.primary} />
          <Text style={styles.detailText}>{user?.location || 'No location set'}</Text>
        </View>
      </GlassCard>

      <Text style={styles.sectionTitle}>Activity</Text>
      <View style={styles.optionsContainer}>
        {renderOption(<History size={20} color={Colors.primary} />, 'Donation History', () => navigation.navigate('RequestHistory'))}
        {renderOption(<Calendar size={20} color={Colors.primary} />, 'Registered Camps', () => navigation.navigate('Camps'))}
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.optionsContainer}>
        {renderOption(<User size={20} color={Colors.primary} />, 'Edit Profile', () => navigation.navigate('Settings'))}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  role: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  bloodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  bloodText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 6,
  },
  detailsCard: {
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
    marginLeft: 12,
  },
});

export default ProfileScreen;
