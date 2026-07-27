import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Colors } from '../constants/Theme';
import { Users, Mail, Trash2, Shield, Droplet } from 'lucide-react-native';
import api from '../services/api';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      // Filter out admins if needed, or show everyone
      setUsers(res.data.filter(u => u.role !== 'admin' && u.role !== 'hospital'));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDelete = (userId) => {
    Alert.alert('Delete User', 'Are you sure you want to delete this user? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
          } catch (err) {
            console.error('Error deleting user:', err);
            Alert.alert('Error', 'Failed to delete user.');
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

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Users size={28} color={Colors.primary} />
          <Text style={styles.title}>Users</Text>
        </View>
        <Badge label={`${users.length} Total`} variant="primary" />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={styles.emailRow}>
                  <Mail size={14} color={Colors.textSecondary} />
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
              </View>
              <Badge
                label={item.role.toUpperCase()}
                variant={item.role === 'donor' ? 'accent' : 'secondary'}
              />
            </View>

            <View style={styles.cardDetails}>
              {item.bloodGroup && (
                <View style={styles.bloodGroupRow}>
                  <Droplet size={16} color={Colors.primary} />
                  <Text style={styles.bloodGroupText}>Blood Group: {item.bloodGroup}</Text>
                </View>
              )}
              {item.verified && (
                <View style={styles.verifiedRow}>
                  <Shield size={16} color={Colors.success} />
                  <Text style={styles.verifiedText}>Email Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                <Trash2 size={18} color={Colors.error} />
                <Text style={styles.deleteBtnText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found.</Text>
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
    marginBottom: 20,
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardDetails: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  bloodGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bloodGroupText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  deleteBtnText: {
    color: Colors.error,
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

export default UsersManagement;
