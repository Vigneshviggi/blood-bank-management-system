import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from './ui/GlassCard';
import { Colors } from '../constants/Theme';
import { MapPin, Droplets, Clock, ChevronRight, Activity } from 'lucide-react-native';
import EmergencyBadge from './EmergencyBadge';

const RequestCard = ({ request, onPress, onRespond }) => {
  const isUrgent = request.emergencyLevel === 'urgent' || request.emergencyLevel === 'critical';
  const units = request.unitsNeeded ?? request.quantity ?? request.units ?? 0;
  const bloodGroup = request.bloodGroup || request.bloodType || 'Blood Needed';
  const requiredDate = request.requiredDate || request.dateRequired || request.createdAt;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={[styles.card, isUrgent && styles.urgentCard]}>
        <View style={styles.header}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{request.patientName || request.hospitalName || 'Blood Request'}</Text>
            <Text style={styles.hospitalName}>{request.reason || request.location || 'Emergency Request'}</Text>
          </View>
          <EmergencyBadge level={request.emergencyLevel} />
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
              <Text style={styles.detailValue} numberOfLines={1}>{request.location}</Text>
            </View>
            <Text style={styles.detailLabel}>Location</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeRow}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.timeText}>Needed by {new Date(requiredDate).toLocaleDateString()}</Text>
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
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
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

