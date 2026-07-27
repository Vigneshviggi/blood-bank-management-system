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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('A+');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hospitals/profile/me`);
      setStock(res.data.stock || {});
    } catch (err) {
      console.error('Error fetching inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (units) => {
    if (units >= 20) return { label: 'Available', color: '#4CAF50', bg: '#E8F5E9' };
    if (units >= 5) return { label: 'Low', color: '#FF9800', bg: '#FFF3E0' };
    return { label: 'Critical', color: '#F44336', bg: '#FFEBEE' };
  };

  const handleUpdateStock = async () => {
    if (!quantity) return;
    setUpdating(true);
    const newStock = { ...stock, [selectedGroup]: (stock[selectedGroup] || 0) + parseInt(quantity) };
    try {
      await api.put(`/hospitals/profile/me`, { stock: newStock });
      setStock(newStock);
      setModalVisible(false);
      setQuantity('');
    } catch (err) {
      console.error('Error updating stock', err);
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
    <ScreenContainer scrollable={false} style={{ paddingHorizontal: 0 }}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Info size={24} color={Colors.text} style={{transform: [{rotate: '180deg'}]}} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Blood Inventory</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.headerCol, {flex: 1}]}>Blood Group</Text>
        <Text style={[styles.headerCol, {flex: 1, textAlign: 'center'}]}>Units Available</Text>
        <Text style={[styles.headerCol, {flex: 1, textAlign: 'right'}]}>Status</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {bloodGroups.map((group) => {
          const units = stock[group] || 0;
          const status = getStatus(units);
          return (
            <View key={group} style={styles.listItem}>
              <View style={[styles.cell, {flex: 1, flexDirection: 'row', alignItems: 'center'}]}>
                <View style={styles.dropIcon}><Info size={14} color={Colors.primary} /></View>
                <Text style={styles.groupText}>{group}</Text>
              </View>
              <Text style={[styles.cell, styles.unitsText, {flex: 1, textAlign: 'center'}]}>{units}</Text>
              <View style={[styles.cell, {flex: 1, alignItems: 'flex-end'}]}>
                <View style={[styles.statusBadge, {backgroundColor: status.bg}]}>
                  <Text style={[styles.statusText, {color: status.color}]}>{status.label}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
            <Plus size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Add Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Edit Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Remove Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>View History</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Basic Stock Update Modal to match Reference 3 */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stock Update</Text>
            
            <Text style={styles.label}>Blood Group</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>{selectedGroup}</Text>
            </View>

            <Text style={styles.label}>Quantity (Units)</Text>
            <TextInput
              style={styles.inputBox}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="e.g. 10"
            />

            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateStock}>
              {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateBtnText}>Update Stock</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  listHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCol: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cell: {
    justifyContent: 'center',
  },
  dropIcon: {
    marginRight: 8,
  },
  groupText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  unitsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  primaryBtn: {
    width: '48%',
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  outlineBtn: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  outlineBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    color: Colors.text,
  },
  inputText: {
    fontSize: 15,
    color: Colors.text,
  },
  updateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  updateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default InventoryScreen;

