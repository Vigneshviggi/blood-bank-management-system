import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import { User, Phone, Mail, ArrowLeft, Droplet } from 'lucide-react-native';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

const CampAttendeesScreen = ({ route }) => {
  const { camp } = route.params;
  const navigation = useNavigation();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    try {
      const res = await api.get(`/camps/${camp._id}/attendees`);
      setAttendees(res.data);
    } catch (err) {
      console.error('Error fetching attendees', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Attendees</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{camp.title}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={attendees}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <User size={24} color={Colors.primary} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.userId?.name || 'Unknown User'}</Text>
                  
                  <View style={styles.contactRow}>
                    <Mail size={12} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{item.userId?.email || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.contactRow}>
                    <Phone size={12} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{item.userId?.phone || item.contactInfo || 'N/A'}</Text>
                  </View>
                </View>
                <View style={styles.bloodGroupBadge}>
                  <Droplet size={14} color="#fff" />
                  <Text style={styles.bloodGroupText}>{item.bloodGroup || item.userId?.bloodGroup}</Text>
                </View>
              </View>
            </GlassCard>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No one has registered for this camp yet.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(217, 45, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  bloodGroupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  bloodGroupText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  }
});

export default CampAttendeesScreen;
