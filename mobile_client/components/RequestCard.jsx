import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from './ui/GlassCard';
import { Colors } from '../constants/Theme';
import { MapPin, Droplets, Clock, ChevronRight, Activity } from 'lucide-react-native';
import EmergencyBadge from './EmergencyBadge';
import Badge from './ui/Badge';

const RequestCard = ({ request, onPress, onRespond }) => {
  const normalizedLevel = String(request.emergencyLevel || request.priority || 'Normal').toLowerCase();
  const isUrgent = normalizedLevel === 'urgent' || normalizedLevel === 'critical' || normalizedLevel === 'high';
  const units = request.unitsNeeded ?? request.quantity ?? request.units ?? 0;
  const bloodGroup = request.bloodGroup || request.bloodType || 'Blood Needed';
  const requiredDate = request.requiredDate || request.dateRequired || request.createdAt;
  const distance = request.distance || request.location || 'Nearby';
  const requesterBadge = request.requesterType === 'hospital' ? 'Verified Hospital' : 'Verified Donor';
  const statusLabel = request.status || 'Pending';
  const statusVariant =
    statusLabel === 'Accepted' ? 'success' :
    statusLabel === 'Completed' ? 'info' :
    statusLabel === 'Cancelled' ? 'neutral' : 'warning';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={[styles.card, isUrgent && styles.urgentCard]}>
        <View style={styles.header}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{request.patientName || request.hospitalName || 'Blood Request'}</Text>
            <Text style={styles.hospitalName} numberOfLines={2}>
              {request.reason || request.location || 'Emergency Request'}
            </Text>
          </View>
          <View style={styles.badgeStack}>
            <EmergencyBadge level={request.emergencyLevel || request.priority} />
            <Badge label={requesterBadge} variant={request.requesterType === 'hospital' ? 'info' : 'success'} style={styles.smallBadge} />
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <View style={[styles.bloodCircle, isUrgent && styles.urgentBlood]}>
              <Text style={styles.bloodText}>{bloodGroup}</Text>
            </View>
            <Text style={styles.detailLabel}>Group</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>{units}</Text>
            <Text style={styles.detailLabel}>Units</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.detailValue} numberOfLines={1}>{distance}</Text>
            </View>
            <Text style={styles.detailLabel}>Location</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerMeta}>
            <View style={styles.timeRow}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.timeText}>Needed by {new Date(requiredDate).toLocaleDateString()}</Text>
            </View>
            <Badge label={statusLabel} variant={statusVariant} style={styles.statusBadge} />
          </View>
          {onRespond ? (
            <TouchableOpacity style={styles.respondBtn} onPress={onRespond}>
              <Text style={styles.respondText}>Respond</Text>
            </TouchableOpacity>
          ) : (
            <ChevronRight size={20} color={Colors.textSecondary} />
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  patientInfo: {
    flex: 1,
    paddingRight: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  hospitalName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeStack: {
    alignItems: 'flex-end',
    gap: 8,
  },
  smallBadge: {
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 45, 32, 0.04)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  bloodCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  urgentBlood: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
  },
  bloodText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '90%',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMeta: {
    flex: 1,
    paddingRight: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  respondBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  respondText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default RequestCard;

