import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Colors } from '../constants/Theme';
import { Hospital, MapPin, Phone, Shield, ShieldAlert, CheckCircle } from 'lucide-react-native';
import api from '../services/api';

const HospitalsManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/hospitals');
      setHospitals(res.data);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHospitals();
  };

  const handleVerify = (hospitalId, hospitalName) => {
    Alert.alert('Verify Hospital', `Are you sure you want to verify ${hospitalName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Verify',
        style: 'default',
        onPress: async () => {
          try {
            await api.put(`/hospitals/${hospitalId}`, { verified: true });
            fetchHospitals();
          } catch (err) {
            console.error('Error verifying hospital:', err);
            Alert.alert('Error', 'Failed to verify hospital.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const unverifiedCount = hospitals.filter(h => !h.verified).length;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Hospital size={28} color={Colors.primary} />
          <Text style={styles.title}>Hospitals</Text>
        </View>
        <Badge label={`${hospitals.length} Total`} variant="primary" />
      </View>

      {unverifiedCount > 0 && (
        <View style={styles.alertBanner}>
          <ShieldAlert size={20} color={Colors.warning} />
          <Text style={styles.alertText}>{unverifiedCount} hospitals pending verification</Text>
        </View>
      )}

      <FlatList
        data={hospitals}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                {item.verified ? (
                  <Badge label="Verified" variant="success" />
                ) : (
                  <Badge label="Unverified" variant="warning" />
                )}
              </View>
            </View>

            <View style={styles.cardDetails}>
              {item.location && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{item.location}</Text>
                </View>
              )}
              {item.contact && (
                <View style={styles.detailRow}>
                  <Phone size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{item.contact}</Text>
                </View>
              )}
            </View>

            {!item.verified && (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(item._id, item.name)}>
                  <CheckCircle size={18} color="#fff" />
                  <Text style={styles.verifyBtnText}>Approve & Verify</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hospitals registered yet.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  alertText: {
    color: Colors.warning,
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardDetails: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

export default HospitalsManagement;
