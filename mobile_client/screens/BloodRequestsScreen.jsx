import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import api from '../services/api';
import { Colors } from '../constants/Theme';
import { Info, MapPin, Calendar, Check, X } from 'lucide-react-native';

const tabs = ['Pending', 'Accepted', 'Completed', 'Rejected'];

const BloodRequestsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // In a real scenario, this would fetch from a hospital-specific endpoint
      const res = await api.get(`/requests`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching requests', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    // For demo purposes, we randomly assign statuses if they don't have one
    const status = req.status || 'Pending';
    return status.toLowerCase() === activeTab.toLowerCase();
  });

  const renderRequestCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.patientName}>{item.patientName || 'Unknown Patient'}</Text>
          <Text style={styles.bloodGroup}>{item.bloodGroup}</Text>
        </View>
        
        <View style={styles.unitRow}>
          <Text style={styles.unitsText}>{item.unitsRequired || 1} Units</Text>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>High</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.hospitalName || 'City Care Hospital'}</Text>
          </View>
          <Text style={styles.distanceText}>2.4 km away</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>18 May 2025, 10:30 AM</Text>
          </View>
        </View>

        {activeTab === 'Pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rejectBtn}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn}>
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={false} style={{ paddingHorizontal: 0 }}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Info size={24} color={Colors.text} style={{transform: [{rotate: '180deg'}]}} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Blood Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === item && styles.activeTabBtn]}
              onPress={() => setActiveTab(item)}
            >
              <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} requests.</Text>
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0E4E4',
    paddingBottom: 12,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F4EEEC',
  },
  activeTabBtn: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0E4E4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  bloodGroup: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 12,
  },
  priorityBadge: {
    backgroundColor: '#FDE7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE7ED',
  },
  priorityText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F0E4E4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectBtnText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
  }
});

export default BloodRequestsScreen;
