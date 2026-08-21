import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import api from '../services/api';
import { Plus, Minus, Save, RefreshCcw, Info } from 'lucide-react-native';

const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const InventoryScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [stock, setStock] = useState({});
  const [hospitalId, setHospitalId] = useState(null);
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
      setHospitalId(res.data._id);
    } catch (err) {
      console.error('Error fetching inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (units) => {
    if (units >= 20) return { label: 'Available', color: Colors.success, bg: 'rgba(3, 152, 85, 0.08)' };
    if (units >= 5) return { label: 'Low', color: Colors.warning, bg: 'rgba(220, 104, 3, 0.08)' };
    return { label: 'Critical', color: Colors.error, bg: '#FDE7ED' };
  };

  const handleUpdateStock = async () => {
    if (!quantity || !hospitalId) return;
    setUpdating(true);
    try {
      const res = await api.put(`/hospitals/${hospitalId}/stock`, {
        bloodGroup: selectedGroup,
        quantity: parseInt(quantity),
        operation: 'add'
      });
      setStock(res.data.data || res.data); // data is the updated stock object
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
    <View style={styles.container}>
      <ScreenHeader title="Blood Inventory" showBack={false} />


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
            <View style={styles.groupContainer}>
              {bloodGroups.map(group => (
                <TouchableOpacity 
                  key={group}
                  style={[styles.groupChip, selectedGroup === group && styles.activeChip]}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text style={[styles.chipText, selectedGroup === group && styles.activeChipText]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E4E4',
  },
  headerCol: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EEEC',
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
  groupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  groupChip: {
    width: '23%',
    paddingVertical: 12,
    backgroundColor: '#F4EEEC',
    borderRadius: 8,
    alignItems: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: '#FDE7ED',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activeChipText: {
    color: Colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#F0E4E4',
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

