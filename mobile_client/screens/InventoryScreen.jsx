import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Plus, Minus, Save, RefreshCcw, Info } from 'lucide-react-native';

const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const InventoryScreen = () => {
  const { user } = useContext(AuthContext);
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/hospitals/${user._id || user.id}`);
      setStock(res.data.stock || {});
    } catch (err) {
      console.error('Error fetching inventory', err);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = (group, delta) => {
    setStock(prev => ({
      ...prev,
      [group]: Math.max(0, (Number(prev[group]) || 0) + delta)
    }));
  };

  const handleManualInput = (group, value) => {
    const numValue = parseInt(value) || 0;
    setStock(prev => ({
      ...prev,
      [group]: numValue
    }));
  };

  const saveInventory = async () => {
    setUpdating(true);
    try {
      await api.put(`/api/hospitals/${user._id || user.id}`, { stock });
      Alert.alert('Success', 'Inventory updated successfully');
    } catch (err) {
      console.error('Error saving inventory', err);
      Alert.alert('Error', 'Failed to update inventory');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ScreenContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Blood Inventory</Text>
            <Text style={styles.subtitle}>Current stock levels in units</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshBtn} 
            onPress={fetchInventory} 
            disabled={updating}
          >
            <RefreshCcw size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {bloodGroups.map((group) => {
              const isLow = (stock[group] || 0) < 5;
              return (
                <GlassCard key={group} style={styles.stockCard}>
                  <View style={styles.cardTop}>
                    <Text style={styles.groupLabel}>{group}</Text>
                    {isLow && (
                      <View style={styles.lowBadge}>
                        <Info size={10} color={Colors.error} />
                        <Text style={styles.lowText}>LOW</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.controlRow}>
                    <TouchableOpacity 
                      style={styles.iconBtn} 
                      onPress={() => handleUpdateStock(group, -1)}
                    >
                      <Minus size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.stockInput}
                      value={String(stock[group] || 0)}
                      onChangeText={(val) => handleManualInput(group, val)}
                      keyboardType="number-pad"
                    />

                    <TouchableOpacity 
                      style={styles.iconBtn} 
                      onPress={() => handleUpdateStock(group, 1)}
                    >
                      <Plus size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            })}
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, updating && styles.disabledBtn]} 
            onPress={saveInventory}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Update Inventory</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 120 }} />
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  refreshBtn: {
    padding: 10,
    backgroundColor: 'rgba(229, 57, 53, 0.05)',
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stockCard: {
    width: '48%',
    marginBottom: 16,
    padding: 16,
    borderRadius: 24,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
  },
  lowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.error,
    marginLeft: 3,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stockInput: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    width: 40,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default InventoryScreen;

