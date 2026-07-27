import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../constants/Theme';
import { MapPin, Calendar, Users, Info, Building2, Clock, Bookmark, Navigation, UserPlus } from 'lucide-react-native';

const CampCard = ({ camp, onPress, onRegister, isRegistered = false, isOrganizer = false }) => {
  const capacity = Number(camp.capacity || 0);
  const registered = Number(camp.registeredCount || 0);
  const occupancy = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;

  const isLive = camp.status === 'Ongoing' || new Date(camp.date).toDateString() === new Date().toDateString();
  const bannerUri = camp.bannerImage || 'https://img.freepik.com/free-vector/blood-donation-concept-illustration_114360-1282.jpg';

  const defaultStartTime = camp.startTime || '09:00 AM';
  const defaultEndTime = camp.endTime || '04:00 PM';

  return (
    <View style={styles.card}>
      {/* LEFT Banners Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: bannerUri }} style={styles.banner} resizeMode="cover" />
        <View style={[styles.statusBadge, isLive ? styles.statusLive : styles.statusUpcoming]}>
          <Text style={styles.statusText}>{isLive ? 'LIVE' : 'UPCOMING'}</Text>
        </View>
      </View>

      {/* RIGHT Content */}
      <View style={styles.content}>
        {/* Title & Bookmark */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{camp.title}</Text>
          <TouchableOpacity style={styles.bookmarkBtn}>
            <Bookmark size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Info Rows */}
        <View style={styles.infoRow}>
          <Building2 size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{camp.organizerName || 'LifeCare Hospitals'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{new Date(camp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          
          <View style={styles.timeSpacer} />
          
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{defaultStartTime} - {defaultEndTime}</Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{camp.location}</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTextRow}>
              <Users size={14} color={Colors.textSecondary} />
              <Text style={styles.progressText}><Text style={{fontWeight: '700'}}>{registered}</Text> / {capacity || '∞'} Registered</Text>
            </View>
            <Text style={styles.percentageText}>{occupancy}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${occupancy}%` }]} />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsRow}>
          {onRegister && (
            <TouchableOpacity 
              style={[styles.actionBtnPrimary, isRegistered && { backgroundColor: '#E0F2F1' }]} 
              onPress={!isRegistered ? onRegister : undefined}
              disabled={isRegistered}
            >
              <UserPlus size={14} color={isRegistered ? '#00897B' : Colors.primary} />
              <Text style={[styles.actionTextPrimary, isRegistered && { color: '#00897B' }]}>
                {isRegistered ? 'Registered' : 'Register'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => {}}>
            <Navigation size={14} color={Colors.text} />
            <Text style={styles.actionTextSecondary}>Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnSecondary} onPress={onPress}>
            <Info size={14} color={Colors.text} />
            <Text style={styles.actionTextSecondary}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  imageContainer: {
    width: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusLive: {
    backgroundColor: '#4CAF50', // Green
  },
  statusUpcoming: {
    backgroundColor: '#FFA726', // Orange
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    paddingRight: 8,
  },
  bookmarkBtn: {
    padding: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  timeSpacer: {
    width: 12,
  },
  progressSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFEBEE',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionTextPrimary: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionTextSecondary: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CampCard;
