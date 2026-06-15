import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import GlassCard from './ui/GlassCard';
import { Colors } from '../constants/Theme';
import { MapPin, Calendar, Users, Info } from 'lucide-react-native';

const CampCard = ({ camp, onPress, onRegister, isOrganizer = false }) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={styles.card}>
        <Image 
          source={{ uri: camp.bannerImage || 'https://img.freepik.com/free-vector/blood-donation-concept-illustration_114360-1282.jpg' }} 
          style={styles.banner} 
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{camp.title}</Text>
          
          <View style={styles.infoRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{camp.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{new Date(camp.date).toLocaleDateString()}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Users size={14} color={Colors.primary} />
              <Text style={styles.statText}>{camp.registeredCount || 0} Registered</Text>
            </View>
            <Text style={styles.capacityText}>Capacity: {camp.capacity}</Text>
          </View>

          {onRegister && (
            <TouchableOpacity style={styles.registerBtn} onPress={onRegister}>
              <Text style={styles.registerText}>Register Now</Text>
            </TouchableOpacity>
          )}

          {isOrganizer && (
            <View style={styles.organizerBadge}>
              <Info size={12} color={Colors.accent} />
              <Text style={styles.organizerText}>You are organizing this</Text>
            </View>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 140,
    backgroundColor: '#eee',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 6,
  },
  capacityText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  registerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  organizerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    padding: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  organizerText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CampCard;

