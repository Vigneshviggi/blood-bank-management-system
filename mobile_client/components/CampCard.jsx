import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Radius, Shadows } from '../constants/Theme';
import { MapPin, Calendar, Users, Info, Building2, Clock, Bookmark, Navigation, CheckCircle2 } from 'lucide-react-native';
import { openCampNavigation } from '../utils/navigationHelper';

const CampCard = ({ camp, onPress, onRegister, isRegistered = false, isOrganizer = false }) => {
  const capacity = Number(camp.capacity || 0);
  const registered = Number(camp.registeredCount || 0);
  const occupancy = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;

  const now = new Date();
  const startDate = new Date(camp.date);
  const isCompleted = camp.status === 'Completed' || (new Date(camp.date).setHours(23, 59, 59, 999) < now);
  const isLive = !isCompleted && startDate.toDateString() === now.toDateString();
  
  let statusText = 'UPCOMING';
  if (isLive) statusText = 'LIVE';
  if (isCompleted) statusText = 'COMPLETED';

  const bannerUri = camp.bannerImage || 'https://img.freepik.com/free-vector/blood-donation-concept-illustration_114360-1282.jpg';

  const defaultStartTime = camp.startTime || '09:00 AM';
  const defaultEndTime = camp.endTime || '04:00 PM';

  const handleNavigate = () => {
    openCampNavigation(camp);
  };

  return (
    <View style={styles.card}>
      {/* LEFT Banner Image */}
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

      {/* RIGHT Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{camp.title || 'Blood Donation Camp'}</Text>
          <TouchableOpacity style={styles.bookmarkBtn}>
            <Bookmark size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Building2 size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{camp.organizerName || 'LifeLink Partner'}</Text>
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
          <Text style={styles.infoText} numberOfLines={1}>{camp.location || 'Location unavailable'}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTextRow}>
              <Users size={14} color={Colors.textSecondary} />
              <Text style={styles.progressText}><Text style={{ fontWeight: '700' }}>{registered}</Text> / {capacity || '∞'} Registered</Text>
            </View>
            <Text style={styles.percentageText}>{occupancy}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${occupancy}%` }]} />
          </View>
        </View>

        <View style={styles.actionsRow}>
          {onRegister && (
            <TouchableOpacity
              style={[styles.actionBtnPrimary, isRegistered && styles.actionBtnRegistered]}
              onPress={!isRegistered && !isCompleted ? onRegister : undefined}
              disabled={isRegistered || isCompleted}
              activeOpacity={0.85}
            >
              {isRegistered && <CheckCircle2 size={14} color="#16A34A" />}
              <Text style={[styles.actionTextPrimary, isRegistered && { color: '#16A34A' }]}>
                {isRegistered ? 'You Registered' : isCompleted ? 'Completed' : 'Register Now'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleNavigate} activeOpacity={0.85}>
            <Navigation size={14} color={Colors.text} />
            <Text style={styles.actionTextSecondary}>Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnSecondary} onPress={onPress} activeOpacity={0.85}>
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 10,
    marginBottom: 16,
    ...Shadows.soft,
  },
  imageContainer: {
    width: 130, // Slightly wider for better proportions
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.backgroundAlt,
    minHeight: 160, // Ensure a minimum height if content is short
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    marginLeft: 14,
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
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primarySoft,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primarySoft,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnRegistered: {
    backgroundColor: '#F0FDF4', // Light green background
  },
  actionTextPrimary: {
    color: '#E53935', // Primary red
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
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
